"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import type { ContentStatus } from "@prisma/client";

export type AdminPageTranslation = { title: string; content: string; seoTitle: string; seoDescription: string };
export type AdminContentPage = {
  id: string;
  slug: string;
  status: "draft" | "published";
  updatedAt: string;
  en: AdminPageTranslation;
  ar: AdminPageTranslation;
};

const STATUS_TO_DB: Record<AdminContentPage["status"], ContentStatus> = { draft: "DRAFT", published: "PUBLISHED" };
const STATUS_FROM_DB: Record<ContentStatus, AdminContentPage["status"]> = { DRAFT: "draft", PUBLISHED: "published" };

function emptyTranslation(): AdminPageTranslation {
  return { title: "", content: "", seoTitle: "", seoDescription: "" };
}

const PAGE_INCLUDE = { translations: true } as const;
type PageRow = { id: string; slug: string; status: ContentStatus; updatedAt: Date; translations: { locale: string; title: string; content: string; seoTitle: string | null; seoDescription: string | null }[] };

function toAdminPage(row: PageRow): AdminContentPage {
  const en = row.translations.find((t) => t.locale === "en");
  const ar = row.translations.find((t) => t.locale === "ar");
  const toTranslation = (t: typeof en): AdminPageTranslation => t ? { title: t.title, content: t.content, seoTitle: t.seoTitle ?? "", seoDescription: t.seoDescription ?? "" } : emptyTranslation();
  return {
    id: row.id,
    slug: row.slug,
    status: STATUS_FROM_DB[row.status],
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
    en: toTranslation(en),
    ar: toTranslation(ar),
  };
}

export async function getAdminContentPages(): Promise<AdminContentPage[]> {
  const rows = await prisma.page.findMany({ include: PAGE_INCLUDE, orderBy: { slug: "asc" } });
  return rows.map(toAdminPage);
}

export async function getAdminContentPageById(id: string): Promise<AdminContentPage | null> {
  const row = await prisma.page.findUnique({ where: { id }, include: PAGE_INCLUDE });
  return row ? toAdminPage(row) : null;
}

function revalidateContentPages(slug?: string) {
  revalidatePath("/admin/content");
  if (slug) revalidatePath(`/[locale]/${slug}`, "page");
}

export async function upsertAdminContentPageAction(input: AdminContentPage): Promise<{ error?: string }> {
  if (!input.slug.trim()) return { error: "Slug is required." };
  if (!input.en.title.trim() || !input.en.content.trim()) return { error: "English title and content are required." };
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");

  try {
    const page = await prisma.page.upsert({
      where: { slug },
      update: { status: STATUS_TO_DB[input.status] },
      create: { slug, status: STATUS_TO_DB[input.status] },
    });

    for (const locale of ["en", "ar"] as const) {
      const t = input[locale];
      if (!t.title.trim() && !t.content.trim()) continue;
      await prisma.pageTranslation.upsert({
        where: { pageId_locale: { pageId: page.id, locale } },
        update: { title: t.title, content: t.content, seoTitle: t.seoTitle, seoDescription: t.seoDescription },
        create: { pageId: page.id, locale, title: t.title, content: t.content, seoTitle: t.seoTitle, seoDescription: t.seoDescription },
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) return { error: "A page with that slug already exists." };
    throw error;
  }

  revalidateContentPages(slug);
  return {};
}

export async function deleteAdminContentPageAction(id: string) {
  await prisma.page.delete({ where: { id } });
  revalidateContentPages();
}

// ---------- Storefront-facing ----------

export type PublicContentPage = { slug: string; title: string; content: string; seoTitle: string; seoDescription: string };

export async function getPublicContentPageBySlug(slug: string, locale: "en" | "ar"): Promise<PublicContentPage | null> {
  const row = await prisma.page.findUnique({ where: { slug }, include: PAGE_INCLUDE });
  if (!row || row.status !== "PUBLISHED") return null;
  const t = row.translations.find((tr) => tr.locale === locale) ?? row.translations.find((tr) => tr.locale === "en");
  if (!t) return null;
  return { slug: row.slug, title: t.title, content: t.content, seoTitle: t.seoTitle ?? "", seoDescription: t.seoDescription ?? "" };
}
