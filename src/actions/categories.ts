"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type AdminCategoryTranslation = { name: string; description: string; seoTitle: string; seoDescription: string };
export type AdminCategoryRow = {
  id: string;
  slug: string;
  imageUrl: string;
  sortOrder: number;
  productCount: number;
  en: AdminCategoryTranslation;
  ar: AdminCategoryTranslation;
};

export type PublicCategoryOption = {
  id: string;
  slug: string;
  sortOrder: number;
  imageUrl: string;
  en: { name: string; description: string };
  ar: { name: string; description: string };
};

function emptyTranslation(): AdminCategoryTranslation {
  return { name: "", description: "", seoTitle: "", seoDescription: "" };
}

const CATEGORY_INCLUDE = { translations: true, _count: { select: { products: true } } } as const;
type CategoryRow = {
  id: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  translations: { locale: string; name: string; description: string | null; seoTitle: string | null; seoDescription: string | null }[];
  _count: { products: number };
};

function toAdminCategory(row: CategoryRow): AdminCategoryRow {
  const en = row.translations.find((t) => t.locale === "en");
  const ar = row.translations.find((t) => t.locale === "ar");
  const toTranslation = (t: typeof en): AdminCategoryTranslation =>
    t ? { name: t.name, description: t.description ?? "", seoTitle: t.seoTitle ?? "", seoDescription: t.seoDescription ?? "" } : emptyTranslation();
  return {
    id: row.id,
    slug: row.slug,
    imageUrl: row.imageUrl ?? "",
    sortOrder: row.sortOrder,
    productCount: row._count.products,
    en: toTranslation(en),
    ar: toTranslation(ar),
  };
}

function revalidateCategories() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/navigation");
  revalidatePath("/[locale]", "layout");
  revalidatePath("/[locale]/shop", "layout");
}

export async function getAdminCategories(): Promise<AdminCategoryRow[]> {
  const rows = await prisma.category.findMany({ include: CATEGORY_INCLUDE, orderBy: { sortOrder: "asc" } });
  return rows.map(toAdminCategory);
}

export async function getPublicCategoryOptions(): Promise<PublicCategoryOption[]> {
  const rows = await prisma.category.findMany({ include: { translations: true }, orderBy: { sortOrder: "asc" } });
  return rows.map((row) => {
    const en = row.translations.find((t) => t.locale === "en");
    const ar = row.translations.find((t) => t.locale === "ar");
    return {
      id: row.id,
      slug: row.slug,
      sortOrder: row.sortOrder,
      imageUrl: row.imageUrl ?? "",
      en: { name: en?.name ?? row.slug, description: en?.description ?? "" },
      ar: { name: ar?.name ?? en?.name ?? row.slug, description: ar?.description ?? "" },
    };
  });
}

export async function upsertAdminCategoryAction(input: AdminCategoryRow): Promise<{ error?: string }> {
  if (!input.slug.trim()) return { error: "Slug is required." };
  if (!input.en.name.trim()) return { error: "English name is required." };
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");

  try {
    const category = input.id
      ? await prisma.category.update({
          where: { id: input.id },
          data: { slug, imageUrl: input.imageUrl.trim() || null },
        })
      : await prisma.category.create({
          data: { slug, imageUrl: input.imageUrl.trim() || null, sortOrder: await prisma.category.count() },
        });

    for (const locale of ["en", "ar"] as const) {
      const t = input[locale];
      if (!t.name.trim()) continue;
      await prisma.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: category.id, locale } },
        update: { name: t.name, description: t.description || null, seoTitle: t.seoTitle || null, seoDescription: t.seoDescription || null },
        create: { categoryId: category.id, locale, name: t.name, description: t.description || null, seoTitle: t.seoTitle || null, seoDescription: t.seoDescription || null },
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) return { error: "A category with that slug already exists." };
    throw error;
  }

  revalidateCategories();
  return {};
}

export async function deleteAdminCategoryAction(id: string): Promise<{ error?: string }> {
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) return { error: `${productCount} product${productCount === 1 ? "" : "s"} use this category — move or delete them first.` };
  await prisma.category.delete({ where: { id } });
  revalidateCategories();
  return {};
}

export async function reorderAdminCategoryAction(id: string, direction: "up" | "down"): Promise<void> {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  const index = categories.findIndex((c) => c.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= categories.length) return;

  await prisma.$transaction([
    prisma.category.update({ where: { id: categories[index].id }, data: { sortOrder: categories[swapWith].sortOrder } }),
    prisma.category.update({ where: { id: categories[swapWith].id }, data: { sortOrder: categories[index].sortOrder } }),
  ]);
  revalidateCategories();
}
