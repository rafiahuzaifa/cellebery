"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import type { ReviewStatus } from "@prisma/client";

export type PublicReview = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  verifiedPurchase: boolean;
  authorName: string;
  createdAt: string;
};

export async function getPublicProductReviews(slug: string): Promise<PublicReview[]> {
  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!product) return [];

  const reviews = await prisma.review.findMany({
    where: { productId: product.id, status: "APPROVED" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    verifiedPurchase: review.verifiedPurchase,
    authorName: review.user.name ?? "CELIBERY Customer",
    createdAt: review.createdAt.toISOString(),
  }));
}

export type ReviewFormState = { error?: string; success?: boolean } | undefined;

/** One review per customer per product — resubmitting updates their existing review and
 * resets it to PENDING for re-moderation rather than creating a duplicate. verifiedPurchase
 * is derived server-side from real order history, never trusted from the client. */
export async function submitReviewAction(_prevState: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in to leave a review." };

  const slug = String(formData.get("slug") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Please select a rating from 1 to 5." };
  if (comment.length < 10) return { error: "Please write at least a few words in your review." };

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { error: "Product not found." };

  const purchase = await prisma.orderItem.findFirst({
    where: { productId: product.id, order: { userId: session.user.id, status: { not: "CANCELLED" } } },
  });

  const existing = await prisma.review.findFirst({ where: { productId: product.id, userId: session.user.id } });
  const data = { rating, title: title || null, comment, locale, verifiedPurchase: Boolean(purchase), status: "PENDING" as ReviewStatus };

  if (existing) {
    await prisma.review.update({ where: { id: existing.id }, data });
  } else {
    await prisma.review.create({ data: { ...data, productId: product.id, userId: session.user.id } });
  }

  revalidatePath(`/${locale}/shop/${slug}`);
  return { success: true };
}

export type AdminReview = {
  id: string;
  productName: string;
  productSlug: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string | null;
  comment: string;
  verifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: string;
};

export async function getAdminReviews(): Promise<AdminReview[]> {
  const reviews = await prisma.review.findMany({
    include: { product: { include: { translations: { where: { locale: "en" } } } }, user: true },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((review) => ({
    id: review.id,
    productName: review.product.translations[0]?.name ?? review.product.slug,
    productSlug: review.product.slug,
    customerName: review.user.name ?? review.user.email,
    customerEmail: review.user.email,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    verifiedPurchase: review.verifiedPurchase,
    status: review.status,
    createdAt: review.createdAt.toISOString(),
  }));
}

function revalidateReviews() {
  revalidatePath("/admin/reviews");
  revalidatePath("/[locale]/shop/[slug]", "page");
}

export async function setReviewStatusAction(id: string, status: ReviewStatus) {
  await prisma.review.update({ where: { id }, data: { status } });
  revalidateReviews();
}

export async function deleteReviewAction(id: string) {
  await prisma.review.delete({ where: { id } });
  revalidateReviews();
}
