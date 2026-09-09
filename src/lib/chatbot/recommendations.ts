import type { ExtractedPreferences, UseCase } from "@/lib/ai/types";
import type { ChatbotProduct } from "./retrieval";

type SpecMap = Record<string, string>;

/** Facts stated as a plain boolean flag row (value "true"), added by the backfill script
 * for claims already present in a product's real feature/description text. */
function specFlag(specs: SpecMap, key: string): boolean {
  return specs[key]?.toLowerCase() === "true";
}
/** Facts stored as a free-text value (e.g. water_resistance="IPX5") — present unless
 * missing or explicitly "none"/"false". */
function specPresent(specs: SpecMap, key: string): boolean {
  const value = specs[key]?.toLowerCase();
  return Boolean(value) && value !== "false" && value !== "none";
}
/** ANC is seeded as "Adaptive" / "None" (descriptive), not a bare boolean. */
function hasAnc(specs: SpecMap): boolean {
  return specPresent(specs, "anc");
}
/** Battery is seeded as free text like "40 hours" / "28 hours total" — pull the number. */
function batteryHours(specs: SpecMap): number {
  const match = specs.battery?.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

type ScoreRule = { points: number; evaluate: (specs: SpecMap, isArabic: boolean) => string | null };

function flagRule(points: number, key: string, reasonEn: string, reasonAr: string): ScoreRule {
  return { points, evaluate: (specs, isArabic) => (specFlag(specs, key) ? (isArabic ? reasonAr : reasonEn) : null) };
}
function presenceRule(points: number, key: string, reasonEn: string, reasonAr: string): ScoreRule {
  return { points, evaluate: (specs, isArabic) => (specPresent(specs, key) ? (isArabic ? reasonAr : reasonEn) : null) };
}
function ancRule(points: number, reasonEn: string, reasonAr: string): ScoreRule {
  return { points, evaluate: (specs, isArabic) => (hasAnc(specs) ? (isArabic ? reasonAr : reasonEn) : null) };
}
function batteryRule(points: number, minHours: number, reasonEn: string, reasonAr: string): ScoreRule {
  return { points, evaluate: (specs, isArabic) => (batteryHours(specs) >= minHours ? (isArabic ? reasonAr : reasonEn) : null) };
}

/** Scoring weights per use case, per spec §6 — configurable here, never exposed to the customer. */
const USE_CASE_RULES: Record<UseCase, ScoreRule[]> = {
  travel: [
    ancRule(30, "Active noise cancellation", "إلغاء ضوضاء نشط"),
    batteryRule(20, 25, "Long battery life for travel", "بطارية تدوم طويلاً للسفر"),
    flagRule(15, "comfort", "Comfortable for long wear", "مريح للاستخدام الطويل"),
    flagRule(10, "foldable", "Foldable, travel-friendly design", "تصميم قابل للطي مناسب للسفر"),
  ],
  music: [
    flagRule(20, "hi_fi_sound", "Studio-tuned sound quality", "جودة صوت بمعايير الاستوديو"),
    flagRule(20, "bass", "Deep, enhanced bass", "باس عميق ومعزز"),
    flagRule(10, "comfort", "Comfortable fit", "ملاءمة مريحة"),
    batteryRule(10, 20, "Solid battery life", "عمر بطارية جيد"),
  ],
  fitness: [
    presenceRule(30, "water_resistance", "Water resistant", "مقاوم للماء"),
    batteryRule(15, 15, "Battery built for workouts", "بطارية تناسب التمارين"),
  ],
  work: [
    flagRule(25, "microphone", "Clear microphone for calls", "ميكروفون واضح للمكالمات"),
    flagRule(20, "comfort", "All-day comfort", "راحة طوال اليوم"),
    ancRule(20, "Noise cancellation for focus", "إلغاء ضوضاء للتركيز"),
  ],
  gaming: [
    flagRule(25, "microphone", "Built-in microphone", "ميكروفون مدمج"),
    batteryRule(15, 20, "Battery for long sessions", "بطارية تكفي لجلسات طويلة"),
  ],
  movies: [
    flagRule(20, "hi_fi_sound", "Immersive, detailed sound", "صوت غامر وواضح"),
    ancRule(20, "Blocks background noise", "يحجب الضوضاء المحيطة"),
    flagRule(15, "comfort", "Comfortable for long viewing", "مريح لمشاهدة طويلة"),
    batteryRule(10, 20, "Battery for a full movie night", "بطارية تكفي لليلة أفلام كاملة"),
  ],
};

const PRIORITY_RULES: Record<string, ScoreRule> = {
  anc: ancRule(25, "Matches your noise-cancellation priority", "يلبي أولويتك في إلغاء الضوضاء"),
  battery: batteryRule(20, 25, "Matches your battery-life priority", "يلبي أولويتك في عمر البطارية"),
  comfort: flagRule(15, "comfort", "Matches your comfort priority", "يلبي أولويتك في الراحة"),
  bass: flagRule(15, "bass", "Matches your bass priority", "يلبي أولويتك في الباس"),
  water_resistance: presenceRule(20, "water_resistance", "Matches your water-resistance priority", "يلبي أولويتك في مقاومة الماء"),
};

export type ScoredProduct = { product: ChatbotProduct; score: number; reasons: string[] };

export function scoreProducts(products: ChatbotProduct[], preferences: ExtractedPreferences, isArabic: boolean): ScoredProduct[] {
  let candidates = products.filter((p) => p.stock > 0);
  if (preferences.category) candidates = candidates.filter((p) => p.category === preferences.category);
  if (preferences.budgetMax) candidates = candidates.filter((p) => (p.salePrice ?? p.price) <= preferences.budgetMax!);
  if (preferences.useCase) candidates = candidates.filter((p) => p.useCases.length === 0 || p.useCases.includes(preferences.useCase!));

  const scored: ScoredProduct[] = candidates.map((product) => {
    let score = 0;
    const reasons: string[] = [];

    const useCaseRules = preferences.useCase ? USE_CASE_RULES[preferences.useCase] : [];
    for (const rule of useCaseRules) {
      const reason = rule.evaluate(product.specs, isArabic);
      if (reason) { score += rule.points; reasons.push(reason); }
    }

    for (const priority of preferences.priorities ?? []) {
      const rule = PRIORITY_RULES[priority];
      if (!rule) continue;
      const reason = rule.evaluate(product.specs, isArabic);
      if (reason && !reasons.includes(reason)) { score += rule.points; reasons.push(reason); }
    }

    // Small tie-break nudge toward real rating/review signal — never fabricated.
    score += product.rating * 2 + Math.min(product.reviewCount, 100) * 0.05;

    return { product, score, reasons };
  });

  scored.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.01) return b.score - a.score;
    if (preferences.priorities?.includes("value")) {
      return (a.product.salePrice ?? a.product.price) - (b.product.salePrice ?? b.product.price);
    }
    return 0;
  });

  return scored;
}
