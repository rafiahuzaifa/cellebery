"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export type HomepageSectionType =
  | "hero"
  | "featured"
  | "categories"
  | "technology"
  | "best-sellers"
  | "promotions"
  | "lifestyle"
  | "reviews"
  | "blog"
  | "newsletter";

export type HomepageSectionCopy = { title: string; subtitle: string; ctaLabel: string };

export type HomepageSection = {
  id: string;
  type: HomepageSectionType;
  enabled: boolean;
  en: HomepageSectionCopy;
  ar: HomepageSectionCopy;
};

type SectionSettings = { en: HomepageSectionCopy; ar: HomepageSectionCopy };

const SEED_SECTIONS: HomepageSection[] = [
  { id: "hero", type: "hero", enabled: true, en: { title: "Sound without limits", subtitle: "Premium audio engineered for everyday life.", ctaLabel: "Explore collection" }, ar: { title: "صوت بلا حدود", subtitle: "صوت فاخر مصمم لحياتك اليومية.", ctaLabel: "استكشف المجموعة" } },
  { id: "featured", type: "featured", enabled: true, en: { title: "Hear every detail", subtitle: "The signature series / X7 Pro", ctaLabel: "Discover X7 Pro" }, ar: { title: "اسمع كل تفصيل", subtitle: "السلسلة المميزة / X7 Pro", ctaLabel: "اكتشف X7 Pro" } },
  { id: "categories", type: "categories", enabled: true, en: { title: "Choose your sound", subtitle: "Headphones, earbuds, and speakers.", ctaLabel: "View all products" }, ar: { title: "اختر صوتك", subtitle: "سماعات الرأس والأذن ومكبرات الصوت.", ctaLabel: "عرض كل المنتجات" } },
  { id: "technology", type: "technology", enabled: true, en: { title: "Why choose CELIBERY?", subtitle: "Premium sound, modern design, all-day comfort.", ctaLabel: "" }, ar: { title: "لماذا تختار سيليبري؟", subtitle: "صوت فاخر، تصميم عصري، راحة طوال اليوم.", ctaLabel: "" } },
  { id: "best-sellers", type: "best-sellers", enabled: true, en: { title: "Best sellers", subtitle: "Most wanted CELIBERY products.", ctaLabel: "View all products" }, ar: { title: "الأكثر مبيعاً", subtitle: "منتجات سيليبري الأكثر طلباً.", ctaLabel: "عرض كل المنتجات" } },
  { id: "lifestyle", type: "lifestyle", enabled: true, en: { title: "Designed for your life", subtitle: "Travel, work, fitness, and home.", ctaLabel: "" }, ar: { title: "مصمم لحياتك", subtitle: "السفر والعمل واللياقة والمنزل.", ctaLabel: "" } },
  { id: "promotions", type: "promotions", enabled: false, en: { title: "Limited time offer", subtitle: "Save on select CELIBERY audio.", ctaLabel: "Shop the sale" }, ar: { title: "عرض لفترة محدودة", subtitle: "وفر على منتجات مختارة من سيليبري.", ctaLabel: "تسوق العرض" } },
  { id: "reviews", type: "reviews", enabled: false, en: { title: "Loved across Saudi Arabia", subtitle: "4.9 out of 5 from verified customers.", ctaLabel: "" }, ar: { title: "محبوب في أنحاء المملكة", subtitle: "4.9 من 5 من عملاء موثقين.", ctaLabel: "" } },
  { id: "blog", type: "blog", enabled: false, en: { title: "CELIBERY Journal", subtitle: "Stories on sound, design, and craft.", ctaLabel: "Read the journal" }, ar: { title: "مجلة سيليبري", subtitle: "قصص عن الصوت والتصميم والحرفية.", ctaLabel: "اقرأ المجلة" } },
  { id: "newsletter", type: "newsletter", enabled: true, en: { title: "Stay in the loop", subtitle: "New drops and offers, straight to your inbox.", ctaLabel: "Subscribe" }, ar: { title: "ابق على اطلاع", subtitle: "أحدث الإصدارات والعروض في بريدك.", ctaLabel: "اشترك" } },
];

const EMPTY_COPY: HomepageSectionCopy = { title: "", subtitle: "", ctaLabel: "" };

function toHomepageSection(row: { id: string; type: string; enabled: boolean; settings: Prisma.JsonValue }): HomepageSection {
  const settings = (row.settings ?? {}) as Partial<SectionSettings>;
  return {
    id: row.id,
    type: row.type as HomepageSectionType,
    enabled: row.enabled,
    en: settings.en ?? EMPTY_COPY,
    ar: settings.ar ?? EMPTY_COPY,
  };
}

function revalidateHomepage() {
  revalidatePath("/admin/homepage");
  revalidatePath("/[locale]", "layout");
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const count = await prisma.homepageSection.count();
  if (count === 0) {
    // Parallel SSG workers (one per locale) can race here — skipDuplicates
    // makes the seed idempotent instead of throwing on a concurrent insert.
    await prisma.homepageSection.createMany({
      data: SEED_SECTIONS.map((section, index) => ({
        id: section.id,
        type: section.type,
        enabled: section.enabled,
        sortOrder: index,
        settings: { en: section.en, ar: section.ar } satisfies SectionSettings,
      })),
      skipDuplicates: true,
    });
  }
  const rows = await prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(toHomepageSection);
}

export async function updateHomepageSectionAction(section: HomepageSection): Promise<void> {
  await prisma.homepageSection.update({
    where: { id: section.id },
    data: { enabled: section.enabled, settings: { en: section.en, ar: section.ar } satisfies SectionSettings },
  });
  revalidateHomepage();
}

export async function toggleHomepageSectionAction(id: string): Promise<void> {
  const section = await prisma.homepageSection.findUnique({ where: { id } });
  if (!section) return;
  await prisma.homepageSection.update({ where: { id }, data: { enabled: !section.enabled } });
  revalidateHomepage();
}

export async function reorderHomepageSectionsAction(orderedIds: string[]): Promise<void> {
  await prisma.$transaction(orderedIds.map((id, index) => prisma.homepageSection.update({ where: { id }, data: { sortOrder: index } })));
  revalidateHomepage();
}
