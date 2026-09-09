export type AdminProductStatus = "draft" | "active" | "archived";
export type AdminCategory = "headphones" | "earbuds" | "speakers" | "accessories";

export type AdminProductTranslation = {
  name: string;
  shortDescription: string;
  description: string;
  features: string[];
  seoTitle: string;
  seoDescription: string;
};

export type AdminProduct = {
  id: string;
  sku: string;
  category: AdminCategory;
  price: number;
  salePrice: number | null;
  stock: number;
  lowStockThreshold: number;
  warrantyMonths: number;
  status: AdminProductStatus;
  image: string;
  rating: number;
  reviewCount: number;
  updatedAt: string;
  /** Use cases (music/travel/work/gaming/fitness/movies) this product is tagged for — feeds
   * the CELIBERY AI recommendation engine (src/lib/chatbot/recommendations.ts). */
  useCases: string[];
  /** Free-form search/browse tags. */
  tags: string[];
  /** Structured key/value facts (battery, anc, water_resistance, comfort, ...) also used by
   * the recommendation engine and chatbot product-question answers. */
  specs: Record<string, string>;
  en: AdminProductTranslation;
  ar: AdminProductTranslation;
};

export function translationStatus(product: AdminProduct): "complete" | "partial" | "missing" {
  const fields = [product.ar.name, product.ar.shortDescription, product.ar.description];
  const filled = fields.filter((field) => field.trim().length > 0).length;
  if (filled === fields.length) return "complete";
  if (filled === 0) return "missing";
  return "partial";
}

export const categoryOptions: { value: AdminCategory; en: string; ar: string }[] = [
  { value: "headphones", en: "Headphones", ar: "سماعات الرأس" },
  { value: "earbuds", en: "Earbuds", ar: "سماعات الأذن" },
  { value: "speakers", en: "Speakers", ar: "مكبرات الصوت" },
  { value: "accessories", en: "Accessories", ar: "الإكسسوارات" },
];

export const useCaseOptions: { value: string; en: string; ar: string }[] = [
  { value: "music", en: "Music", ar: "الموسيقى" },
  { value: "travel", en: "Travel", ar: "السفر" },
  { value: "work", en: "Work", ar: "العمل" },
  { value: "gaming", en: "Gaming", ar: "الألعاب" },
  { value: "fitness", en: "Fitness", ar: "اللياقة" },
  { value: "movies", en: "Movies", ar: "الأفلام" },
];
