"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import type { ContentStatus } from "@prisma/client";

export type AdminBlogTranslation = { title: string; excerpt: string; content: string; seoTitle: string; seoDescription: string };
export type AdminBlogPost = {
  id: string;
  slug: string;
  status: "draft" | "published";
  featuredImage: string;
  updatedAt: string;
  en: AdminBlogTranslation;
  ar: AdminBlogTranslation;
};

const STATUS_TO_DB: Record<AdminBlogPost["status"], ContentStatus> = { draft: "DRAFT", published: "PUBLISHED" };
const STATUS_FROM_DB: Record<ContentStatus, AdminBlogPost["status"]> = { DRAFT: "draft", PUBLISHED: "published" };

function emptyTranslation(): AdminBlogTranslation {
  return { title: "", excerpt: "", content: "", seoTitle: "", seoDescription: "" };
}

const POST_INCLUDE = { translations: true } as const;
type PostRow = { id: string; slug: string; status: ContentStatus; featuredImage: string | null; updatedAt: Date; translations: { locale: string; title: string; excerpt: string | null; content: string; seoTitle: string | null; seoDescription: string | null }[] };

function toAdminPost(row: PostRow): AdminBlogPost {
  const en = row.translations.find((t) => t.locale === "en");
  const ar = row.translations.find((t) => t.locale === "ar");
  const toTranslation = (t: typeof en): AdminBlogTranslation => t ? { title: t.title, excerpt: t.excerpt ?? "", content: t.content, seoTitle: t.seoTitle ?? "", seoDescription: t.seoDescription ?? "" } : emptyTranslation();
  return {
    id: row.id,
    slug: row.slug,
    status: STATUS_FROM_DB[row.status],
    featuredImage: row.featuredImage ?? "",
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
    en: toTranslation(en),
    ar: toTranslation(ar),
  };
}

export async function getAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const rows = await prisma.blogPost.findMany({ include: POST_INCLUDE, orderBy: { createdAt: "desc" } });
  return rows.map(toAdminPost);
}

export async function getAdminBlogPostById(id: string): Promise<AdminBlogPost | null> {
  const row = await prisma.blogPost.findUnique({ where: { id }, include: POST_INCLUDE });
  return row ? toAdminPost(row) : null;
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function revalidateBlog(slug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/[locale]/blog", "layout");
  if (slug) revalidatePath(`/[locale]/blog/${slug}`, "page");
}

export async function upsertAdminBlogPostAction(input: AdminBlogPost): Promise<{ error?: string }> {
  if (!input.en.title.trim() || !input.en.content.trim()) return { error: "English title and content are required." };
  const slug = input.slug.trim() || slugify(input.en.title) || `post-${Date.now()}`;

  try {
    const post = await prisma.blogPost.upsert({
      where: { slug },
      update: { status: STATUS_TO_DB[input.status], featuredImage: input.featuredImage || null, publishedAt: input.status === "published" ? new Date() : undefined },
      create: { slug, status: STATUS_TO_DB[input.status], featuredImage: input.featuredImage || null, publishedAt: input.status === "published" ? new Date() : null },
    });

    for (const locale of ["en", "ar"] as const) {
      const t = input[locale];
      if (!t.title.trim() && !t.content.trim()) continue;
      await prisma.blogTranslation.upsert({
        where: { postId_locale: { postId: post.id, locale } },
        update: { title: t.title, excerpt: t.excerpt, content: t.content, seoTitle: t.seoTitle, seoDescription: t.seoDescription },
        create: { postId: post.id, locale, title: t.title, excerpt: t.excerpt, content: t.content, seoTitle: t.seoTitle, seoDescription: t.seoDescription },
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) return { error: "A post with that slug already exists." };
    throw error;
  }

  revalidateBlog(slug);
  return {};
}

export async function deleteAdminBlogPostAction(id: string) {
  await prisma.blogPost.delete({ where: { id } });
  revalidateBlog();
}

// ---------- Storefront-facing ----------

export type PublicBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  featuredImage: string;
  publishedAt: string;
};

function toPublicPost(row: PostRow, locale: "en" | "ar"): PublicBlogPost | null {
  const t = row.translations.find((tr) => tr.locale === locale) ?? row.translations.find((tr) => tr.locale === "en");
  if (!t) return null;
  return {
    slug: row.slug,
    title: t.title,
    excerpt: t.excerpt ?? "",
    content: t.content,
    seoTitle: t.seoTitle ?? "",
    seoDescription: t.seoDescription ?? "",
    featuredImage: row.featuredImage ?? "",
    publishedAt: row.updatedAt.toISOString(),
  };
}

export async function getPublicBlogPosts(locale: "en" | "ar"): Promise<PublicBlogPost[]> {
  const rows = await prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, include: POST_INCLUDE, orderBy: { publishedAt: "desc" } });
  return rows.map((row) => toPublicPost(row, locale)).filter((post): post is PublicBlogPost => post !== null);
}

export async function getPublicBlogPostBySlug(slug: string, locale: "en" | "ar"): Promise<PublicBlogPost | null> {
  const row = await prisma.blogPost.findUnique({ where: { slug }, include: POST_INCLUDE });
  if (!row || row.status !== "PUBLISHED") return null;
  return toPublicPost(row, locale);
}
