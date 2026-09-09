import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export type ChatbotProduct = {
  id: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  salePrice: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  image: string;
  name: string;
  nameAr: string;
  shortDescription: string;
  warrantyMonths: number;
  useCases: string[];
  tags: string[];
  specs: Record<string, string>;
};

const CATALOG_INCLUDE = {
  translations: true,
  category: true,
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  inventory: true,
  specifications: { where: { locale: "en" } },
} satisfies Prisma.ProductInclude;

type CatalogRow = Prisma.ProductGetPayload<{ include: typeof CATALOG_INCLUDE }>;

function toChatbotProduct(row: CatalogRow): ChatbotProduct {
  const en = row.translations.find((t) => t.locale === "en");
  const ar = row.translations.find((t) => t.locale === "ar");
  const specs: Record<string, string> = {};
  for (const spec of row.specifications) specs[spec.key] = spec.value;
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    category: row.category.slug,
    price: Number(row.price),
    salePrice: row.salePrice != null ? Number(row.salePrice) : null,
    stock: row.inventory?.stock ?? 0,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    image: row.images[0]?.url ?? "/products/headphones-classic.jpg",
    name: en?.name ?? row.slug,
    nameAr: ar?.name ?? "",
    shortDescription: en?.shortDescription ?? "",
    warrantyMonths: row.warrantyMonths,
    useCases: row.useCases,
    tags: row.tags,
    specs,
  };
}

let cachedCatalog: { at: number; data: ChatbotProduct[] } | null = null;
const CATALOG_CACHE_MS = 30_000;

/** Active products with specs/useCases/tags flattened for scoring. Cached briefly — this
 * is called on every chat turn, and the catalog changes rarely relative to chat volume. */
export async function getChatbotCatalog(): Promise<ChatbotProduct[]> {
  if (cachedCatalog && Date.now() - cachedCatalog.at < CATALOG_CACHE_MS) return cachedCatalog.data;
  const rows = await prisma.product.findMany({ where: { status: "ACTIVE" }, include: CATALOG_INCLUDE });
  const data = rows.map(toChatbotProduct);
  cachedCatalog = { at: Date.now(), data };
  return data;
}

export async function searchProducts(query: string): Promise<ChatbotProduct[]> {
  const catalog = await getChatbotCatalog();
  const q = query.trim().toLowerCase();
  if (!q) return catalog;
  return catalog.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.nameAr.includes(q) ||
    p.sku.toLowerCase().includes(q) ||
    p.shortDescription.toLowerCase().includes(q) ||
    p.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}

export type FaqResult = { id: string; category: string; question: string; answer: string };

export async function searchFaqs(query: string, locale: "en" | "ar"): Promise<FaqResult[]> {
  const faqs = await prisma.fAQ.findMany({
    where: { active: true },
    include: { translations: { where: { locale } } },
    orderBy: { sortOrder: "asc" },
  });
  const q = query.trim().toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  return faqs
    .map((faq) => ({ faq, t: faq.translations[0] }))
    .filter(({ t }) => Boolean(t))
    .filter(({ t }) => q.length === 0 || t!.question.toLowerCase().includes(q) || words.some((w) => t!.question.toLowerCase().includes(w) || t!.answer.toLowerCase().includes(w)))
    .map(({ faq, t }) => ({ id: faq.id, category: faq.category, question: t!.question, answer: t!.answer }));
}

export type KnowledgeResult = { id: string; slug: string; category: string; title: string; body: string };

export async function searchKnowledge(category: string | null, locale: "en" | "ar"): Promise<KnowledgeResult[]> {
  const articles = await prisma.knowledgeArticle.findMany({
    where: { published: true, ...(category ? { category } : {}) },
    include: { translations: { where: { locale } } },
    orderBy: { priority: "desc" },
  });
  return articles
    .map((article) => ({ article, t: article.translations[0] }))
    .filter(({ t }) => Boolean(t))
    .map(({ article, t }) => ({ id: article.id, slug: article.slug, category: article.category, title: t!.title, body: t!.body }));
}

export type ShippingInfo = {
  zoneName: string;
  regions: string[];
  methods: { name: string; nameAr: string; price: number; freeThreshold: number | null; minDays: number; maxDays: number }[];
};

export async function getShippingInfo(): Promise<ShippingInfo[]> {
  const zones = await prisma.shippingZone.findMany({
    where: { active: true },
    include: { methods: { where: { active: true } } },
  });
  return zones.map((zone) => ({
    zoneName: zone.name,
    regions: zone.regions,
    methods: zone.methods.map((m) => ({
      name: m.name,
      nameAr: m.nameAr,
      price: Number(m.price),
      freeThreshold: m.freeThreshold != null ? Number(m.freeThreshold) : null,
      minDays: m.minDays,
      maxDays: m.maxDays,
    })),
  }));
}

export type GuestOrderResult = {
  number: string;
  status: string;
  createdAt: Date;
  items: { name: string; quantity: number }[];
} | null;

/** Guest order lookup — never returns data unless the provided email matches the order's
 * customerEmail exactly (case-insensitive). This is the only order-access path today since
 * there is no customer login system (see plan §14 Guest Order Support). */
export async function lookupGuestOrder(orderNumber: string, email: string): Promise<GuestOrderResult> {
  const order = await prisma.order.findUnique({ where: { number: orderNumber }, include: { items: true } });
  if (!order) return null;
  if (order.customerEmail.toLowerCase() !== email.trim().toLowerCase()) return null;
  return {
    number: order.number,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({ name: item.name, quantity: item.quantity })),
  };
}
