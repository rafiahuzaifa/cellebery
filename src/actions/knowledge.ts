"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type AdminFaq = {
  id: string;
  category: string;
  sortOrder: number;
  active: boolean;
  en: { question: string; answer: string };
  ar: { question: string; answer: string };
};

export type AdminKnowledgeArticle = {
  id: string;
  slug: string;
  category: string;
  priority: number;
  published: boolean;
  en: { title: string; body: string };
  ar: { title: string; body: string };
};

function revalidateKnowledge() {
  revalidatePath("/admin/knowledge");
}

// ---------- FAQ ----------

const FAQ_INCLUDE = { translations: true } as const;
type FaqRow = { id: string; category: string; sortOrder: number; active: boolean; translations: { locale: string; question: string; answer: string }[] };

function toAdminFaq(row: FaqRow): AdminFaq {
  const en = row.translations.find((t) => t.locale === "en");
  const ar = row.translations.find((t) => t.locale === "ar");
  return {
    id: row.id,
    category: row.category,
    sortOrder: row.sortOrder,
    active: row.active,
    en: { question: en?.question ?? "", answer: en?.answer ?? "" },
    ar: { question: ar?.question ?? "", answer: ar?.answer ?? "" },
  };
}

export async function getAdminFaqs(): Promise<AdminFaq[]> {
  const rows = await prisma.fAQ.findMany({ include: FAQ_INCLUDE, orderBy: { sortOrder: "asc" } });
  return rows.map(toAdminFaq);
}

export async function upsertAdminFaqAction(input: AdminFaq): Promise<{ error?: string }> {
  if (!input.en.question.trim() || !input.en.answer.trim()) return { error: "English question and answer are required." };

  const faq = input.id
    ? await prisma.fAQ.update({ where: { id: input.id }, data: { category: input.category, sortOrder: input.sortOrder, active: input.active } })
    : await prisma.fAQ.create({ data: { category: input.category, sortOrder: input.sortOrder, active: input.active } });

  for (const locale of ["en", "ar"] as const) {
    const t = input[locale];
    if (!t.question.trim() && !t.answer.trim()) continue;
    await prisma.fAQTranslation.upsert({
      where: { faqId_locale: { faqId: faq.id, locale } },
      update: { question: t.question, answer: t.answer },
      create: { faqId: faq.id, locale, question: t.question, answer: t.answer },
    });
  }

  revalidateKnowledge();
  return {};
}

export async function deleteAdminFaqAction(id: string) {
  await prisma.fAQ.delete({ where: { id } });
  revalidateKnowledge();
}

export async function toggleAdminFaqStatusAction(id: string) {
  const faq = await prisma.fAQ.findUnique({ where: { id } });
  if (!faq) return;
  await prisma.fAQ.update({ where: { id }, data: { active: !faq.active } });
  revalidateKnowledge();
}

// ---------- Knowledge Articles ----------

const ARTICLE_INCLUDE = { translations: true } as const;
type ArticleRow = { id: string; slug: string; category: string; priority: number; published: boolean; translations: { locale: string; title: string; body: string }[] };

function toAdminArticle(row: ArticleRow): AdminKnowledgeArticle {
  const en = row.translations.find((t) => t.locale === "en");
  const ar = row.translations.find((t) => t.locale === "ar");
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    priority: row.priority,
    published: row.published,
    en: { title: en?.title ?? "", body: en?.body ?? "" },
    ar: { title: ar?.title ?? "", body: ar?.body ?? "" },
  };
}

export async function getAdminKnowledgeArticles(): Promise<AdminKnowledgeArticle[]> {
  const rows = await prisma.knowledgeArticle.findMany({ include: ARTICLE_INCLUDE, orderBy: { priority: "desc" } });
  return rows.map(toAdminArticle);
}

export async function upsertAdminKnowledgeArticleAction(input: AdminKnowledgeArticle): Promise<{ error?: string }> {
  if (!input.en.title.trim() || !input.en.body.trim()) return { error: "English title and body are required." };

  const slug = input.slug.trim() || input.en.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `article-${Date.now()}`;

  try {
    const article = await prisma.knowledgeArticle.upsert({
      where: { slug },
      update: { category: input.category, priority: input.priority, published: input.published },
      create: { slug, category: input.category, priority: input.priority, published: input.published },
    });

    for (const locale of ["en", "ar"] as const) {
      const t = input[locale];
      if (!t.title.trim() && !t.body.trim()) continue;
      await prisma.knowledgeArticleTranslation.upsert({
        where: { articleId_locale: { articleId: article.id, locale } },
        update: { title: t.title, body: t.body },
        create: { articleId: article.id, locale, title: t.title, body: t.body },
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) return { error: "An article with that slug already exists." };
    throw error;
  }

  revalidateKnowledge();
  return {};
}

export async function deleteAdminKnowledgeArticleAction(id: string) {
  await prisma.knowledgeArticle.delete({ where: { id } });
  revalidateKnowledge();
}

export async function toggleAdminKnowledgeArticleStatusAction(id: string) {
  const article = await prisma.knowledgeArticle.findUnique({ where: { id } });
  if (!article) return;
  await prisma.knowledgeArticle.update({ where: { id }, data: { published: !article.published } });
  revalidateKnowledge();
}

// ---------- Test console ----------

/** Runs a real message through the same chat pipeline /api/chat uses, in a throwaway
 * session that's deleted immediately after — lets an admin verify how a question would
 * actually be answered (using real, live knowledge/product data) without polluting the
 * chatbot analytics or leaving fake conversations behind. */
export async function testChatbotMessage(message: string, locale: "en" | "ar"): Promise<{ message: string; intent: string }> {
  const { runChatPipeline } = await import("@/lib/chatbot/pipeline");
  const session = await prisma.chatSession.create({ data: { guestKey: `admin-test-${Date.now()}-${Math.random().toString(36).slice(2)}`, language: locale } });
  try {
    const response = await runChatPipeline({ message, locale, sessionId: session.id, history: [] });
    return { message: response.message, intent: response.intent };
  } finally {
    await prisma.chatSession.delete({ where: { id: session.id } });
  }
}
