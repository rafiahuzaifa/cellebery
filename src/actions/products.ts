"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import type { Prisma, ProductStatus as DbProductStatus } from "@prisma/client";
import type { AdminCategory, AdminProduct, AdminProductStatus, AdminProductTranslation } from "@/lib/admin/catalog";

const STATUS_TO_DB: Record<AdminProductStatus, DbProductStatus> = { draft: "DRAFT", active: "ACTIVE", archived: "ARCHIVED" };
const STATUS_FROM_DB: Record<DbProductStatus, AdminProductStatus> = { DRAFT: "draft", ACTIVE: "active", ARCHIVED: "archived" };

const PRODUCT_INCLUDE = {
  translations: true,
  category: true,
  inventory: true,
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

function emptyTranslation(): AdminProductTranslation {
  return { name: "", shortDescription: "", description: "", features: [], seoTitle: "", seoDescription: "" };
}

function toAdminProduct(product: ProductWithRelations): AdminProduct {
  const en = product.translations.find((t) => t.locale === "en");
  const ar = product.translations.find((t) => t.locale === "ar");
  const toTranslation = (row: typeof en): AdminProductTranslation => row ? {
    name: row.name,
    shortDescription: row.shortDescription ?? "",
    description: row.description ?? "",
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    seoTitle: row.seoTitle ?? "",
    seoDescription: row.seoDescription ?? "",
  } : emptyTranslation();

  return {
    id: product.slug,
    sku: product.sku,
    category: product.category.slug as AdminCategory,
    price: Number(product.price),
    salePrice: product.salePrice != null ? Number(product.salePrice) : null,
    stock: product.inventory?.stock ?? 0,
    lowStockThreshold: product.inventory?.lowStockThreshold ?? 5,
    warrantyMonths: product.warrantyMonths,
    status: STATUS_FROM_DB[product.status],
    image: product.images[0]?.url ?? "/products/headphones-classic.jpg",
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    updatedAt: product.updatedAt.toISOString().slice(0, 10),
    en: toTranslation(en),
    ar: toTranslation(ar),
  };
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const products = await prisma.product.findMany({ include: PRODUCT_INCLUDE, orderBy: { createdAt: "desc" } });
  return products.map(toAdminProduct);
}

export async function getAdminProductBySlug(slug: string): Promise<AdminProduct | null> {
  const product = await prisma.product.findUnique({ where: { slug }, include: PRODUCT_INCLUDE });
  return product ? toAdminProduct(product) : null;
}

/** Storefront-facing: published products only. */
export async function getPublicProducts(): Promise<AdminProduct[]> {
  const products = await prisma.product.findMany({ where: { status: "ACTIVE" }, include: PRODUCT_INCLUDE, orderBy: { createdAt: "desc" } });
  return products.map(toAdminProduct);
}

/** Storefront-facing: a single published product, or null if missing/unpublished. */
export async function getPublicProductBySlug(slug: string): Promise<AdminProduct | null> {
  const product = await prisma.product.findUnique({ where: { slug }, include: PRODUCT_INCLUDE });
  return product && product.status === "ACTIVE" ? toAdminProduct(product) : null;
}

function revalidateStorefront() {
  revalidatePath("/admin/products");
  revalidatePath("/[locale]", "layout");
  revalidatePath("/[locale]/shop", "layout");
}

export async function upsertAdminProductAction(input: AdminProduct): Promise<{ error?: string }> {
  const category = await prisma.category.findUnique({ where: { slug: input.category } });
  if (!category) return { error: `Unknown category: ${input.category}` };

  const slug = input.id || input.en.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `product-${Date.now()}`;

  try {
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        sku: input.sku,
        status: STATUS_TO_DB[input.status],
        price: input.price,
        salePrice: input.salePrice,
        rating: input.rating,
        reviewCount: input.reviewCount,
        warrantyMonths: input.warrantyMonths,
        categoryId: category.id,
        publishedAt: input.status === "active" ? new Date() : undefined,
      },
      create: {
        slug,
        sku: input.sku,
        status: STATUS_TO_DB[input.status],
        price: input.price,
        salePrice: input.salePrice,
        rating: input.rating,
        reviewCount: input.reviewCount,
        warrantyMonths: input.warrantyMonths,
        categoryId: category.id,
        publishedAt: input.status === "active" ? new Date() : null,
      },
    });

    for (const locale of ["en", "ar"] as const) {
      const t = input[locale];
      await prisma.productTranslation.upsert({
        where: { productId_locale: { productId: product.id, locale } },
        update: { name: t.name, shortDescription: t.shortDescription, description: t.description, features: t.features, seoTitle: t.seoTitle, seoDescription: t.seoDescription },
        create: { productId: product.id, locale, name: t.name, shortDescription: t.shortDescription, description: t.description, features: t.features, seoTitle: t.seoTitle, seoDescription: t.seoDescription },
      });
    }

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: { stock: input.stock, lowStockThreshold: input.lowStockThreshold },
      create: { productId: product.id, stock: input.stock, lowStockThreshold: input.lowStockThreshold },
    });

    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id }, orderBy: { sortOrder: "asc" } });
    if (existingImage) {
      await prisma.productImage.update({ where: { id: existingImage.id }, data: { url: input.image } });
    } else {
      await prisma.productImage.create({ data: { productId: product.id, url: input.image, sortOrder: 0 } });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A product with that SKU or slug already exists." };
    }
    throw error;
  }

  revalidateStorefront();
  return {};
}

export async function deleteAdminProductAction(slug: string) {
  await prisma.product.delete({ where: { slug } });
  revalidateStorefront();
}

export async function setAdminProductStatusAction(slug: string, status: AdminProductStatus) {
  await prisma.product.update({
    where: { slug },
    data: { status: STATUS_TO_DB[status], publishedAt: status === "active" ? new Date() : undefined },
  });
  revalidateStorefront();
}

export async function duplicateAdminProductAction(slug: string) {
  const source = await getAdminProductBySlug(slug);
  if (!source) return;

  const copyId = `${source.id}-copy-${Date.now().toString(36)}`;
  await upsertAdminProductAction({
    ...source,
    id: copyId,
    sku: `${source.sku}-COPY`,
    status: "draft",
    en: { ...source.en, name: `${source.en.name} (Copy)` },
  });
}
