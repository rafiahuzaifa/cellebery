import type { ChatIntent, ExtractedPreferences, UseCase } from "@/lib/ai/types";

const HANDOFF_WORDS = ["human", "agent", "representative", "real person", "talk to someone", "مندوب", "دعم بشري", "موظف", "شخص حقيقي"];
const ORDER_WORDS = ["order", "track", "where is my", "delivery status", "طلبي", "تتبع", "شحنتي", "حالة الطلب"];
const COMPARE_WORDS = ["compare", " vs ", "versus", "which is better", "قارن", "مقارنة", "أيهما أفضل"];
const CART_WORDS = ["add to cart", "add it", "add this", "remove from cart", "my cart", "checkout", "buy it", "أضف", "السلة", "سلتي", "احذف"];
const WARRANTY_WORDS = ["warranty", "return", "refund", "exchange", "defective", "broken", "ضمان", "إرجاع", "استرجاع", "تالف"];
const SHIPPING_WORDS = ["shipping", "delivery", "deliver", "how long to arrive", "شحن", "توصيل", "متى يصل"];
const PRODUCT_QUESTION_WORDS = ["does it", "does this", "is it", "how long does", "battery life", "waterproof", "specs", "specification", "range", "iphone", "android", "هل يحتوي", "هل هو", "مواصفات", "بطارية تدوم"];
const PRODUCT_DISCOVERY_WORDS = ["headphone", "earbud", "speaker", "recommend", "suggest", "need", "looking for", "best for", "want", "سماعات", "سماعة", "مكبر", "أوصي", "أحتاج", "أبحث عن"];
const GREETING_WORDS = ["hi", "hello", "hey", "salam", "assalam", "مرحبا", "السلام عليكم", "أهلا"];

const CATEGORY_MAP: [string, ExtractedPreferences["category"]][] = [
  ["headphones", "headphones"], ["headphone", "headphones"], ["سماعات رأس", "headphones"], ["سماعة رأس", "headphones"],
  ["earbuds", "earbuds"], ["earbud", "earbuds"], ["سماعات أذن", "earbuds"], ["سماعة أذن", "earbuds"], ["سماعات لاسلكية", "earbuds"],
  ["speakers", "speakers"], ["speaker", "speakers"], ["مكبر", "speakers"], ["مكبرات", "speakers"],
  ["accessories", "accessories"], ["accessory", "accessories"], ["إكسسوار", "accessories"],
];

const USE_CASE_MAP: [string, UseCase][] = [
  ["music", "music"], ["موسيقى", "music"],
  ["travel", "travel"], ["سفر", "travel"],
  ["work", "work"], ["office", "work"], ["عمل", "work"], ["مكتب", "work"],
  ["gaming", "gaming"], ["game", "gaming"], ["ألعاب", "gaming"], ["قيمنق", "gaming"],
  ["fitness", "fitness"], ["gym", "fitness"], ["workout", "fitness"], ["رياضة", "fitness"], ["لياقة", "fitness"],
  ["movie", "movies"], ["movies", "movies"], ["أفلام", "movies"],
];

const PRIORITY_MAP: [string, string][] = [
  ["noise cancellation", "anc"], ["noise-cancellation", "anc"], ["anc", "anc"], ["إلغاء ضوضاء", "anc"], ["إلغاء الضوضاء", "anc"],
  ["battery", "battery"], ["بطارية", "battery"],
  ["comfort", "comfort"], ["comfortable", "comfort"], ["راحة", "comfort"], ["مريح", "comfort"],
  ["bass", "bass"], ["باس", "bass"],
  ["portab", "portability"], ["محمول", "portability"], ["خفيف", "portability"],
  ["water", "water_resistance"], ["waterproof", "water_resistance"], ["مقاومة للماء", "water_resistance"], ["مقاوم للماء", "water_resistance"],
  ["value", "value"], ["cheap", "value"], ["budget", "value"], ["قيمة", "value"], ["رخيص", "value"],
];

// The exact short quick-reply chip labels shown mid-discovery ("Battery life", "Noise
// cancellation", ...). These can textually overlap PRODUCT_QUESTION_WORDS (e.g. "battery
// life" is both a spec question and a priority chip) — when they arrive as a short reply
// inside an active discovery flow, context makes them a priority selection, not a question.
const DISCOVERY_CONTINUATION_WORDS = [...CATEGORY_MAP, ...USE_CASE_MAP, ...PRIORITY_MAP].map(([keyword]) => keyword);

function includesAny(message: string, words: string[]): boolean {
  return words.some((word) => message.includes(word));
}

export function classifyIntent(rawMessage: string, hasPreviousPreferences: boolean): ChatIntent {
  const message = rawMessage.toLowerCase();
  const wordCount = message.trim().split(/\s+/).length;

  if (includesAny(message, HANDOFF_WORDS)) return "support_handoff";
  if (includesAny(message, ORDER_WORDS)) return "order_status";
  if (includesAny(message, COMPARE_WORDS)) return "comparison";
  if (includesAny(message, CART_WORDS)) return "cart_action";
  if (includesAny(message, WARRANTY_WORDS)) return "warranty_returns";
  if (includesAny(message, SHIPPING_WORDS)) return "shipping";

  if (hasPreviousPreferences && wordCount <= 4 && !message.includes("?") && includesAny(message, DISCOVERY_CONTINUATION_WORDS)) {
    return "product_discovery";
  }

  if (includesAny(message, PRODUCT_QUESTION_WORDS)) return "product_question";
  if (includesAny(message, PRODUCT_DISCOVERY_WORDS) || hasPreviousPreferences) return "product_discovery";
  if (includesAny(message, GREETING_WORDS) && wordCount <= 4) return "greeting";
  return "unknown";
}

export function extractPreferences(rawMessage: string, previous: ExtractedPreferences): ExtractedPreferences {
  const message = rawMessage.toLowerCase();
  const next: ExtractedPreferences = { ...previous };

  for (const [keyword, category] of CATEGORY_MAP) {
    if (message.includes(keyword)) { next.category = category; break; }
  }
  for (const [keyword, useCase] of USE_CASE_MAP) {
    if (message.includes(keyword)) { next.useCase = useCase; break; }
  }

  const priorities = new Set(next.priorities ?? []);
  for (const [keyword, priority] of PRIORITY_MAP) {
    if (message.includes(keyword)) priorities.add(priority);
  }
  if (priorities.size > 0) next.priorities = [...priorities];

  const budgetMatch = message.match(/(?:sar|ر\.?س\.?|under|below|أقل من|حتى)\s*(\d{2,5})|(\d{2,5})\s*(?:sar|ر\.?س\.?)/);
  if (budgetMatch) {
    const value = Number(budgetMatch[1] ?? budgetMatch[2]);
    if (Number.isFinite(value) && value > 0) next.budgetMax = value;
  }

  return next;
}
