"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type HeroFeature = { en: string; ar: string };

export type AdminHeroCampaign = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  desktopVideo: string;
  mobileVideo: string;
  posterImage: string;
  ctaText: string;
  ctaTextAr: string;
  ctaLink: string;
  secondaryText: string;
  secondaryTextAr: string;
  secondaryLink: string;
  features: HeroFeature[];
  productId: string;
  sortOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

export type HeroProductOption = { id: string; label: string };

function toAdminHeroCampaign(row: {
  id: string; title: string; titleAr: string; description: string; descriptionAr: string;
  desktopVideo: string | null; mobileVideo: string | null; posterImage: string;
  ctaText: string; ctaTextAr: string; ctaLink: string;
  secondaryText: string | null; secondaryTextAr: string | null; secondaryLink: string | null;
  features: unknown; productId: string | null; sortOrder: number; isActive: boolean;
  startDate: Date | null; endDate: Date | null;
}): AdminHeroCampaign {
  return {
    id: row.id,
    title: row.title,
    titleAr: row.titleAr,
    description: row.description,
    descriptionAr: row.descriptionAr,
    desktopVideo: row.desktopVideo ?? "",
    mobileVideo: row.mobileVideo ?? "",
    posterImage: row.posterImage,
    ctaText: row.ctaText,
    ctaTextAr: row.ctaTextAr,
    ctaLink: row.ctaLink,
    secondaryText: row.secondaryText ?? "",
    secondaryTextAr: row.secondaryTextAr ?? "",
    secondaryLink: row.secondaryLink ?? "",
    features: Array.isArray(row.features) ? (row.features as HeroFeature[]) : [],
    productId: row.productId ?? "",
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    startDate: row.startDate ? row.startDate.toISOString().slice(0, 10) : "",
    endDate: row.endDate ? row.endDate.toISOString().slice(0, 10) : "",
  };
}

export async function getAdminHeroCampaigns(): Promise<AdminHeroCampaign[]> {
  const rows = await prisma.heroCampaign.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(toAdminHeroCampaign);
}

export async function getHeroProductOptions(): Promise<HeroProductOption[]> {
  const products = await prisma.product.findMany({ include: { translations: { where: { locale: "en" } } }, orderBy: { createdAt: "desc" } });
  return products.map((p) => ({ id: p.id, label: p.translations[0]?.name ?? p.slug }));
}

function revalidateHero() {
  revalidatePath("/admin/hero");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/[slug]", "page");
}

export async function upsertHeroCampaignAction(input: AdminHeroCampaign): Promise<{ error?: string }> {
  if (!input.title.trim() || !input.titleAr.trim()) return { error: "Title (EN + AR) is required." };
  if (!input.description.trim() || !input.descriptionAr.trim()) return { error: "Description (EN + AR) is required." };
  if (!input.posterImage.trim()) return { error: "A poster image is required (used as the fallback and while video loads)." };
  if (!input.ctaText.trim() || !input.ctaTextAr.trim()) return { error: "CTA text (EN + AR) is required." };
  if (!input.ctaLink.trim()) return { error: "CTA link is required." };

  const data = {
    title: input.title.trim(),
    titleAr: input.titleAr.trim(),
    description: input.description.trim(),
    descriptionAr: input.descriptionAr.trim(),
    desktopVideo: input.desktopVideo.trim() || null,
    mobileVideo: input.mobileVideo.trim() || null,
    posterImage: input.posterImage.trim(),
    ctaText: input.ctaText.trim(),
    ctaTextAr: input.ctaTextAr.trim(),
    ctaLink: input.ctaLink.trim(),
    secondaryText: input.secondaryText.trim() || null,
    secondaryTextAr: input.secondaryTextAr.trim() || null,
    secondaryLink: input.secondaryLink.trim() || null,
    features: input.features.length > 0 ? input.features : undefined,
    productId: input.productId || null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
  };

  if (input.id) {
    await prisma.heroCampaign.update({ where: { id: input.id }, data });
  } else {
    await prisma.heroCampaign.create({ data });
  }
  revalidateHero();
  return {};
}

export async function deleteHeroCampaignAction(id: string): Promise<void> {
  await prisma.heroCampaign.delete({ where: { id } });
  revalidateHero();
}

export async function toggleHeroCampaignStatusAction(id: string): Promise<void> {
  const row = await prisma.heroCampaign.findUnique({ where: { id }, select: { isActive: true } });
  if (!row) return;
  await prisma.heroCampaign.update({ where: { id }, data: { isActive: !row.isActive } });
  revalidateHero();
}

export async function reorderHeroCampaignAction(id: string, direction: "up" | "down"): Promise<void> {
  const campaigns = await prisma.heroCampaign.findMany({ orderBy: { sortOrder: "asc" } });
  const index = campaigns.findIndex((c) => c.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= campaigns.length) return;

  await prisma.$transaction([
    prisma.heroCampaign.update({ where: { id: campaigns[index].id }, data: { sortOrder: campaigns[swapWith].sortOrder } }),
    prisma.heroCampaign.update({ where: { id: campaigns[swapWith].id }, data: { sortOrder: campaigns[index].sortOrder } }),
  ]);
  revalidateHero();
}

// --- Storefront-facing ---

export type PublicHeroSlide = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  desktopVideo: string | null;
  mobileVideo: string | null;
  posterImage: string;
  ctaText: string;
  ctaTextAr: string;
  ctaLink: string;
  secondaryText: string | null;
  secondaryTextAr: string | null;
  secondaryLink: string | null;
  features: HeroFeature[];
};

export async function getPublicHeroCampaigns(): Promise<PublicHeroSlide[]> {
  const now = new Date();
  const rows = await prisma.heroCampaign.findMany({
    where: {
      isActive: true,
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    titleAr: row.titleAr,
    description: row.description,
    descriptionAr: row.descriptionAr,
    desktopVideo: row.desktopVideo,
    mobileVideo: row.mobileVideo,
    posterImage: row.posterImage,
    ctaText: row.ctaText,
    ctaTextAr: row.ctaTextAr,
    ctaLink: row.ctaLink,
    secondaryText: row.secondaryText,
    secondaryTextAr: row.secondaryTextAr,
    secondaryLink: row.secondaryLink,
    features: Array.isArray(row.features) ? (row.features as HeroFeature[]) : [],
  }));
}
