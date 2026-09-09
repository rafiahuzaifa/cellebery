"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type AdminPromotion = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  productIds: string[];
  categoryIds: string[];
};

export type PromotionOption = { id: string; label: string };

function toAdminPromotion(row: { id: string; name: string; startsAt: Date; endsAt: Date; active: boolean; products: { productId: string }[]; categories: { categoryId: string }[] }): AdminPromotion {
  return {
    id: row.id,
    name: row.name,
    startsAt: row.startsAt.toISOString().slice(0, 10),
    endsAt: row.endsAt.toISOString().slice(0, 10),
    active: row.active,
    productIds: row.products.map((p) => p.productId),
    categoryIds: row.categories.map((c) => c.categoryId),
  };
}

export async function getAdminPromotions(): Promise<AdminPromotion[]> {
  const rows = await prisma.promotion.findMany({
    include: { products: true, categories: true },
    orderBy: { startsAt: "desc" },
  });
  return rows.map(toAdminPromotion);
}

export async function getPromotionProductOptions(): Promise<PromotionOption[]> {
  const products = await prisma.product.findMany({
    include: { translations: { where: { locale: "en" } } },
    orderBy: { createdAt: "desc" },
  });
  return products.map((p) => ({ id: p.id, label: p.translations[0]?.name ?? p.slug }));
}

export async function getPromotionCategoryOptions(): Promise<PromotionOption[]> {
  const categories = await prisma.category.findMany({ include: { translations: { where: { locale: "en" } } }, orderBy: { sortOrder: "asc" } });
  return categories.map((c) => ({ id: c.id, label: c.translations[0]?.name ?? c.slug }));
}

function revalidatePromotions() {
  revalidatePath("/admin/promotions");
}

export async function upsertAdminPromotionAction(input: AdminPromotion): Promise<{ error?: string }> {
  if (!input.name.trim()) return { error: "Promotion name is required." };
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (!input.startsAt || !input.endsAt || endsAt < startsAt) return { error: "Please provide a valid start and end date." };

  const promotion = input.id
    ? await prisma.promotion.update({ where: { id: input.id }, data: { name: input.name.trim(), startsAt, endsAt, active: input.active } })
    : await prisma.promotion.create({ data: { name: input.name.trim(), startsAt, endsAt, active: input.active } });

  await prisma.promotionProduct.deleteMany({ where: { promotionId: promotion.id } });
  if (input.productIds.length > 0) {
    await prisma.promotionProduct.createMany({ data: input.productIds.map((productId) => ({ promotionId: promotion.id, productId })) });
  }

  await prisma.promotionCategory.deleteMany({ where: { promotionId: promotion.id } });
  if (input.categoryIds.length > 0) {
    await prisma.promotionCategory.createMany({ data: input.categoryIds.map((categoryId) => ({ promotionId: promotion.id, categoryId })) });
  }

  revalidatePromotions();
  return {};
}

export async function deleteAdminPromotionAction(id: string) {
  await prisma.promotion.delete({ where: { id } });
  revalidatePromotions();
}

export async function toggleAdminPromotionStatusAction(id: string) {
  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) return;
  await prisma.promotion.update({ where: { id }, data: { active: !promotion.active } });
  revalidatePromotions();
}
