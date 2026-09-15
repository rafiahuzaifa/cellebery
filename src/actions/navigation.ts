"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type NavLinkType = "custom" | "category";

export type AdminNavItem = {
  id: string;
  labelEn: string;
  labelAr: string;
  linkType: NavLinkType;
  customPath: string;
  categoryId: string;
  sortOrder: number;
  enabled: boolean;
  showInPrimary: boolean;
};

export type PublicNavItem = {
  id: string;
  en: string;
  ar: string;
  path: string;
  showInPrimary: boolean;
};

// Seed values mirror the navbar links that were hardcoded in site-nav.tsx before
// this became admin-managed, so the first load looks identical to before.
const SEED_ITEMS: { labelEn: string; labelAr: string; linkType: NavLinkType; customPath: string | null; categorySlug: string | null; showInPrimary: boolean }[] = [
  { labelEn: "Shop", labelAr: "المتجر", linkType: "custom", customPath: "/shop", categorySlug: null, showInPrimary: true },
  { labelEn: "Headphones", labelAr: "سماعات الرأس", linkType: "category", customPath: null, categorySlug: "headphones", showInPrimary: true },
  { labelEn: "Earbuds", labelAr: "سماعات الأذن", linkType: "category", customPath: null, categorySlug: "earbuds", showInPrimary: true },
  { labelEn: "Speakers", labelAr: "مكبرات الصوت", linkType: "category", customPath: null, categorySlug: "speakers", showInPrimary: true },
  { labelEn: "Accessories", labelAr: "الإكسسوارات", linkType: "category", customPath: null, categorySlug: "accessories", showInPrimary: false },
  { labelEn: "New arrivals", labelAr: "وصل حديثاً", linkType: "custom", customPath: "/shop?sort=newest", categorySlug: null, showInPrimary: false },
  { labelEn: "Journal", labelAr: "المجلة", linkType: "custom", customPath: "/blog", categorySlug: null, showInPrimary: false },
  { labelEn: "Our story", labelAr: "قصتنا", linkType: "custom", customPath: "#story", categorySlug: null, showInPrimary: true },
];

type NavRow = {
  id: string;
  labelEn: string;
  labelAr: string;
  linkType: string;
  customPath: string | null;
  categoryId: string | null;
  sortOrder: number;
  enabled: boolean;
  showInPrimary: boolean;
  category: { slug: string } | null;
};

function toAdminNavItem(row: NavRow): AdminNavItem {
  return {
    id: row.id,
    labelEn: row.labelEn,
    labelAr: row.labelAr,
    linkType: row.linkType === "category" ? "category" : "custom",
    customPath: row.customPath ?? "",
    categoryId: row.categoryId ?? "",
    sortOrder: row.sortOrder,
    enabled: row.enabled,
    showInPrimary: row.showInPrimary,
  };
}

function revalidateNavigation() {
  revalidatePath("/admin/navigation");
  revalidatePath("/[locale]", "layout");
}

async function seedNavItemsIfEmpty() {
  const count = await prisma.navItem.count();
  if (count > 0) return;

  let sortOrder = 0;
  for (const item of SEED_ITEMS) {
    let categoryId: string | null = null;
    if (item.linkType === "category" && item.categorySlug) {
      const category = await prisma.category.findUnique({ where: { slug: item.categorySlug } });
      if (!category) continue; // categories not seeded yet — admin can add this link manually later
      categoryId = category.id;
    }
    await prisma.navItem.create({
      data: {
        labelEn: item.labelEn,
        labelAr: item.labelAr,
        linkType: item.linkType,
        customPath: item.customPath,
        categoryId,
        sortOrder: sortOrder++,
        enabled: true,
        showInPrimary: item.showInPrimary,
      },
    });
  }
}

export async function getAdminNavItems(): Promise<AdminNavItem[]> {
  await seedNavItemsIfEmpty();
  const rows = await prisma.navItem.findMany({ orderBy: { sortOrder: "asc" }, include: { category: { select: { slug: true } } } });
  return rows.map(toAdminNavItem);
}

export async function getPublicNavItems(): Promise<PublicNavItem[]> {
  await seedNavItemsIfEmpty();
  const rows = await prisma.navItem.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
    include: { category: { select: { slug: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    en: row.labelEn,
    ar: row.labelAr,
    path: row.linkType === "category" && row.category ? `/shop?category=${row.category.slug}` : row.customPath || "/shop",
    showInPrimary: row.showInPrimary,
  }));
}

export async function upsertAdminNavItemAction(input: AdminNavItem): Promise<{ error?: string }> {
  if (!input.labelEn.trim() || !input.labelAr.trim()) return { error: "Label (EN + AR) is required." };
  if (input.linkType === "category" && !input.categoryId) return { error: "Choose a category for this link." };
  if (input.linkType === "custom" && !input.customPath.trim()) return { error: "Enter a link path, e.g. /shop or /blog." };

  const data = {
    labelEn: input.labelEn.trim(),
    labelAr: input.labelAr.trim(),
    linkType: input.linkType,
    customPath: input.linkType === "custom" ? input.customPath.trim() : null,
    categoryId: input.linkType === "category" ? input.categoryId : null,
    enabled: input.enabled,
    showInPrimary: input.showInPrimary,
  };

  if (input.id) {
    await prisma.navItem.update({ where: { id: input.id }, data });
  } else {
    const count = await prisma.navItem.count();
    await prisma.navItem.create({ data: { ...data, sortOrder: count } });
  }
  revalidateNavigation();
  return {};
}

export async function deleteAdminNavItemAction(id: string): Promise<void> {
  await prisma.navItem.delete({ where: { id } });
  revalidateNavigation();
}

export async function toggleAdminNavItemEnabledAction(id: string): Promise<void> {
  const row = await prisma.navItem.findUnique({ where: { id }, select: { enabled: true } });
  if (!row) return;
  await prisma.navItem.update({ where: { id }, data: { enabled: !row.enabled } });
  revalidateNavigation();
}

export async function toggleAdminNavItemPrimaryAction(id: string): Promise<void> {
  const row = await prisma.navItem.findUnique({ where: { id }, select: { showInPrimary: true } });
  if (!row) return;
  await prisma.navItem.update({ where: { id }, data: { showInPrimary: !row.showInPrimary } });
  revalidateNavigation();
}

export async function reorderAdminNavItemAction(id: string, direction: "up" | "down"): Promise<void> {
  const items = await prisma.navItem.findMany({ orderBy: { sortOrder: "asc" } });
  const index = items.findIndex((i) => i.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= items.length) return;

  await prisma.$transaction([
    prisma.navItem.update({ where: { id: items[index].id }, data: { sortOrder: items[swapWith].sortOrder } }),
    prisma.navItem.update({ where: { id: items[swapWith].id }, data: { sortOrder: items[index].sortOrder } }),
  ]);
  revalidateNavigation();
}
