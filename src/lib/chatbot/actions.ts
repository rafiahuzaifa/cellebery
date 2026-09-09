import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getChatbotCatalog, searchFaqs, searchKnowledge, getShippingInfo, lookupGuestOrder } from "./retrieval";
import { scoreProducts, type ScoredProduct } from "./recommendations";

/**
 * Server-side tools the chat pipeline calls once intent is classified. Every tool
 * validates its input with Zod and only ever touches Prisma through the retrieval
 * layer — the AI model never sees or executes a database query directly (spec §25).
 */

const preferencesSchema = z.object({
  category: z.enum(["headphones", "earbuds", "speakers", "accessories"]).optional(),
  useCase: z.enum(["music", "travel", "work", "gaming", "fitness", "movies"]).optional(),
  priorities: z.array(z.string()).optional(),
  budgetMax: z.number().positive().optional(),
});

export const getRecommendationsSchema = z.object({
  preferences: preferencesSchema,
  locale: z.enum(["en", "ar"]),
  limit: z.number().int().min(1).max(6).default(3),
});
export async function getRecommendations(input: z.input<typeof getRecommendationsSchema>): Promise<ScoredProduct[]> {
  const parsed = getRecommendationsSchema.parse(input);
  const catalog = await getChatbotCatalog();
  const scored = scoreProducts(catalog, parsed.preferences, parsed.locale === "ar");
  return scored.slice(0, parsed.limit);
}

export const compareProductsSchema = z.object({ slugs: z.array(z.string()).min(2).max(4) });
export async function compareProducts(input: z.input<typeof compareProductsSchema>) {
  const parsed = compareProductsSchema.parse(input);
  const catalog = await getChatbotCatalog();
  return catalog.filter((p) => parsed.slugs.includes(p.slug));
}

export const getProductSchema = z.object({ slug: z.string().min(1) });
export async function getProduct(input: z.input<typeof getProductSchema>) {
  const parsed = getProductSchema.parse(input);
  const catalog = await getChatbotCatalog();
  return catalog.find((p) => p.slug === parsed.slug) ?? null;
}

export const searchProductsSchema = z.object({ query: z.string().min(1) });
export async function searchProductsTool(input: z.input<typeof searchProductsSchema>) {
  const parsed = searchProductsSchema.parse(input);
  const catalog = await getChatbotCatalog();
  const q = parsed.query.toLowerCase();
  return catalog.filter((p) => p.name.toLowerCase().includes(q) || p.nameAr.includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));
}

export const getFaqSchema = z.object({ query: z.string().min(1), locale: z.enum(["en", "ar"]) });
export async function getFaq(input: z.input<typeof getFaqSchema>) {
  const parsed = getFaqSchema.parse(input);
  return searchFaqs(parsed.query, parsed.locale);
}

export const getKnowledgeSchema = z.object({ category: z.string().nullable(), locale: z.enum(["en", "ar"]) });
export async function getKnowledge(input: z.input<typeof getKnowledgeSchema>) {
  const parsed = getKnowledgeSchema.parse(input);
  return searchKnowledge(parsed.category, parsed.locale);
}

export async function getShippingPolicy() {
  return getShippingInfo();
}

export const lookupOrderSchema = z.object({ orderNumber: z.string().min(3), email: z.string().email() });
export async function lookupOrder(input: z.input<typeof lookupOrderSchema>) {
  const parsed = lookupOrderSchema.parse(input);
  return lookupGuestOrder(parsed.orderNumber, parsed.email);
}

export const createSupportRequestSchema = z.object({
  subject: z.string().min(3).max(200),
  category: z.string().min(1).max(60),
  guestEmail: z.string().email().optional(),
  chatSessionId: z.string().min(1),
});
export async function createSupportRequest(input: z.input<typeof createSupportRequestSchema>) {
  const parsed = createSupportRequestSchema.parse(input);
  return prisma.supportTicket.create({
    data: { subject: parsed.subject, category: parsed.category, guestEmail: parsed.guestEmail, chatSessionId: parsed.chatSessionId },
  });
}
