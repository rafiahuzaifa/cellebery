import type { AIMessage, ChatAction, ChatProductCardData, StructuredResponse } from "@/lib/ai/types";
import { generateMessage } from "@/lib/ai/provider";
import { classifyIntent, extractPreferences } from "./intent";
import { loadContext, saveContext } from "./context";
import { getRecommendations, compareProducts, getProduct, getFaq, getKnowledge, getShippingPolicy, lookupOrder, createSupportRequest } from "./actions";
import type { ChatbotProduct } from "./retrieval";
import type { ScoredProduct } from "./recommendations";

type Locale = "en" | "ar";
const t = (en: string, ar: string, isArabic: boolean) => (isArabic ? ar : en);

function toCard(product: ChatbotProduct, reason: string, locale: Locale): ChatProductCardData {
  return {
    slug: product.slug,
    name: locale === "ar" && product.nameAr ? product.nameAr : product.name,
    reason,
    price: product.price,
    salePrice: product.salePrice,
    rating: product.rating,
    image: product.image,
    inStock: product.stock > 0,
    keySpec: reason,
  };
}

const ORDER_NUMBER_RE = /CEL-[A-Z0-9]+/i;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export async function runChatPipeline(input: {
  message: string;
  locale: Locale;
  sessionId: string;
  history: AIMessage[];
  productContext?: string;
}): Promise<StructuredResponse> {
  const { message, locale, sessionId, history, productContext } = input;
  const isArabic = locale === "ar";
  const ctx = await loadContext(sessionId);

  const hasPreviousSignal = Boolean(ctx.preferences.category || ctx.preferences.useCase || (ctx.preferences.priorities?.length ?? 0) > 0);
  const intent = classifyIntent(message, hasPreviousSignal);
  const preferences = extractPreferences(message, ctx.preferences);

  const base = {
    intent,
    products: [] as ChatProductCardData[],
    actions: [] as ChatAction[],
    suggestedReplies: [] as string[],
    needsHumanHandoff: false,
    sessionId,
  };

  let result: StructuredResponse;
  let retrievedContext = "";
  const nextContext = { ...ctx, preferences };

  switch (intent) {
    case "greeting": {
      result = {
        ...base,
        message: t(
          "Hi! I'm CELIBERY AI. I can help you find the right sound, compare products, or answer questions about shipping, warranty, and orders. What can I help with?",
          "مرحباً! أنا مساعد CELIBERY AI. يمكنني مساعدتك في اختيار الصوت المناسب، مقارنة المنتجات، أو الإجابة عن أسئلة الشحن والضمان والطلبات. كيف يمكنني مساعدتك؟",
          isArabic,
        ),
        suggestedReplies: [
          t("Find my perfect product", "اعثر على المنتج المناسب", isArabic),
          t("Shipping & delivery", "الشحن والتوصيل", isArabic),
          t("Track my order", "تتبع طلبي", isArabic),
        ],
      };
      break;
    }

    case "product_discovery": {
      if (!preferences.useCase) {
        result = {
          ...base,
          message: t("What will you mainly use them for?", "ما هو استخدامك الأساسي لها؟", isArabic),
          suggestedReplies: [
            t("Music", "الموسيقى", isArabic),
            t("Travel", "السفر", isArabic),
            t("Work", "العمل", isArabic),
            t("Gaming", "الألعاب", isArabic),
            t("Fitness", "اللياقة", isArabic),
            t("Movies", "الأفلام", isArabic),
          ],
        };
      } else if (!preferences.priorities || preferences.priorities.length === 0) {
        result = {
          ...base,
          message: t("What matters most to you?", "ما الأهم بالنسبة لك؟", isArabic),
          suggestedReplies: [
            t("Noise cancellation", "إلغاء الضوضاء", isArabic),
            t("Battery life", "عمر البطارية", isArabic),
            t("Comfort", "الراحة", isArabic),
            t("Best value", "أفضل قيمة", isArabic),
          ],
        };
      } else {
        const scored: ScoredProduct[] = await getRecommendations({ preferences, locale, limit: 3 });
        if (scored.length === 0) {
          result = {
            ...base,
            message: t(
              "I couldn't find a product matching all of that yet — want to try a different budget or category?",
              "لم أجد منتجاً يطابق كل هذه المعايير حالياً — هل تود تجربة ميزانية أو فئة مختلفة؟",
              isArabic,
            ),
            suggestedReplies: [t("Try a higher budget", "جرب ميزانية أعلى", isArabic), t("Different category", "فئة مختلفة", isArabic)],
          };
        } else {
          const cards = scored.map((s) => toCard(s.product, s.reasons[0] ?? "", locale));
          result = {
            ...base,
            message: t(
              `Based on ${preferences.useCase} and what matters to you, here are your strongest matches:`,
              `بناءً على استخدام ${preferences.useCase} وما يهمك، إليك أفضل الخيارات المطابقة:`,
              isArabic,
            ),
            products: cards,
            suggestedReplies: cards.length > 1
              ? [t("Compare them", "قارن بينها", isArabic), t("Add the first one to cart", "أضف الأول للسلة", isArabic)]
              : [t("Add to cart", "أضف للسلة", isArabic)],
          };
          nextContext.lastRecommendedSlugs = cards.map((c) => c.slug);
        }
      }
      retrievedContext = JSON.stringify({ preferences, resultCount: result.products.length });
      break;
    }

    case "comparison": {
      const slugs = ctx.lastRecommendedSlugs && ctx.lastRecommendedSlugs.length >= 2 ? ctx.lastRecommendedSlugs.slice(0, 4) : [];
      if (slugs.length < 2) {
        result = {
          ...base,
          message: t(
            "Which products would you like me to compare? Try finding a recommendation first, or open two product pages.",
            "أي منتجات تود أن أقارن بينها؟ جرّب الحصول على توصية أولاً، أو افتح صفحتي منتجين.",
            isArabic,
          ),
        };
      } else {
        const products = await compareProducts({ slugs });
        const cards = products.map((p) => toCard(p, "", locale));
        const rows = [
          { label: t("Price", "السعر", isArabic), values: products.map((p) => `SAR ${p.salePrice ?? p.price}`) },
          { label: t("Rating", "التقييم", isArabic), values: products.map((p) => `${p.rating}`) },
          { label: t("Noise cancellation", "إلغاء الضوضاء", isArabic), values: products.map((p) => (p.specs.anc && p.specs.anc.toLowerCase() !== "none" ? t("Yes", "نعم", isArabic) : t("No", "لا", isArabic))) },
          { label: t("Battery", "البطارية", isArabic), values: products.map((p) => p.specs.battery || t("Not confirmed", "غير مؤكد", isArabic)) },
          { label: t("Water resistance", "مقاومة الماء", isArabic), values: products.map((p) => p.specs.water_resistance || t("Not confirmed", "غير مؤكد", isArabic)) },
          { label: t("Warranty", "الضمان", isArabic), values: products.map((p) => `${p.warrantyMonths} ${t("months", "شهر", isArabic)}`) },
        ];
        const cheapest = [...products].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))[0];
        const bestRated = [...products].sort((a, b) => b.rating - a.rating)[0];
        result = {
          ...base,
          message: t("Here's how they compare:", "إليك المقارنة بينها:", isArabic),
          comparison: { products: cards, rows, bestOverall: bestRated?.slug, bestValue: cheapest?.slug },
          suggestedReplies: [t("Add one to cart", "أضف واحداً للسلة", isArabic)],
        };
      }
      break;
    }

    case "product_question": {
      const targetSlug = productContext ?? ctx.lastRecommendedSlugs?.[0] ?? ctx.lastDiscussedSlug;
      const product = targetSlug ? await getProduct({ slug: targetSlug }) : null;
      if (!product) {
        result = {
          ...base,
          message: t("Which product are you asking about?", "عن أي منتج تسأل؟", isArabic),
        };
      } else {
        const q = message.toLowerCase();
        const ancPresent = Boolean(product.specs.anc) && product.specs.anc.toLowerCase() !== "none";
        let answer: string | null = null;
        if (/battery/.test(q) && product.specs.battery) {
          answer = t(`The ${product.name} lasts about ${product.specs.battery} on a full charge.`, `تدوم بطارية ${product.name} حوالي ${product.specs.battery} بشحنة كاملة.`, isArabic);
        } else if (/(anc|noise)/.test(q) && product.specs.anc) {
          answer = ancPresent
            ? t(`Yes, the ${product.name} has active noise cancellation.`, `نعم، ${product.name} تحتوي على إلغاء ضوضاء نشط.`, isArabic)
            : t(`The ${product.name} does not have active noise cancellation.`, `${product.name} لا تحتوي على إلغاء ضوضاء نشط.`, isArabic);
        } else if (/water|proof/.test(q) && product.specs.water_resistance) {
          answer = t(`The ${product.name} has ${product.specs.water_resistance} water resistance.`, `تتمتع ${product.name} بمقاومة للماء بمعيار ${product.specs.water_resistance}.`, isArabic);
        } else if (/bluetooth/.test(q) && product.specs.bluetooth) {
          answer = t(`The ${product.name} uses Bluetooth ${product.specs.bluetooth}.`, `تستخدم ${product.name} بلوتوث ${product.specs.bluetooth}.`, isArabic);
        } else if (/(call|mic)/.test(q) && product.specs.microphone) {
          answer = product.specs.microphone.toLowerCase() === "true"
            ? t(`Yes, the ${product.name} has a built-in microphone for calls.`, `نعم، ${product.name} تحتوي على ميكروفون مدمج للمكالمات.`, isArabic)
            : t(`I don't have a confirmed microphone specification for the ${product.name} yet.`, `لا تتوفر لدي مواصفات مؤكدة للميكروفون في ${product.name} حالياً.`, isArabic);
        }
        if (!answer) {
          answer = t("I don't have a confirmed specification for that yet. Let me connect you with CELIBERY support.", "لا تتوفر لدي مواصفات مؤكدة لذلك حالياً. دعني أوصلك بدعم CELIBERY.", isArabic);
        }
        result = { ...base, message: answer, products: [toCard(product, "", locale)] };
        nextContext.lastDiscussedSlug = product.slug;
      }
      break;
    }

    case "cart_action": {
      const targetSlug = productContext ?? ctx.lastRecommendedSlugs?.[0] ?? ctx.lastDiscussedSlug;
      const product = targetSlug ? await getProduct({ slug: targetSlug }) : null;
      if (!product) {
        result = { ...base, message: t("Which product would you like to add to your cart?", "أي منتج تود إضافته إلى سلتك؟", isArabic) };
      } else {
        const name = locale === "ar" && product.nameAr ? product.nameAr : product.name;
        result = {
          ...base,
          message: t(`Added ${name} to your cart.`, `تمت إضافة ${name} إلى سلتك.`, isArabic),
          actions: [
            { type: "add_to_cart", slug: product.slug, name, price: product.salePrice ?? product.price, image: product.image },
            { type: "view_cart" },
          ],
          suggestedReplies: [t("View cart", "عرض السلة", isArabic), t("Continue shopping", "متابعة التسوق", isArabic)],
        };
      }
      break;
    }

    case "order_status": {
      const orderMatch = message.match(ORDER_NUMBER_RE);
      const emailMatch = message.match(EMAIL_RE);
      if (!orderMatch || !emailMatch) {
        result = {
          ...base,
          message: t("Could you share your order number (e.g. CEL-XXXXX) and the email used at checkout?", "هل يمكنك مشاركة رقم الطلب (مثال: CEL-XXXXX) والبريد الإلكتروني المستخدم عند الشراء؟", isArabic),
        };
      } else {
        const order = await lookupOrder({ orderNumber: orderMatch[0].toUpperCase(), email: emailMatch[0] });
        if (!order) {
          result = {
            ...base,
            message: t("I couldn't verify an order with those details. Please double-check the order number and email, or contact support.", "لم أتمكن من التحقق من طلب بهذه البيانات. يرجى التأكد من رقم الطلب والبريد الإلكتروني، أو التواصل مع الدعم.", isArabic),
            needsHumanHandoff: true,
          };
        } else {
          result = {
            ...base,
            message: t(`Order ${order.number} is currently ${order.status}.`, `طلبك ${order.number} حالته حالياً ${order.status}.`, isArabic),
            orderStatus: {
              orderNumber: order.number,
              status: order.status,
              createdAt: order.createdAt.toISOString(),
              items: order.items,
              trackingAvailable: false,
            },
          };
        }
      }
      break;
    }

    case "shipping": {
      const zones = await getShippingPolicy();
      if (zones.length === 0 || zones.every((z) => z.methods.length === 0)) {
        result = {
          ...base,
          message: t("I don't have confirmed shipping details configured yet. Let me connect you with CELIBERY support.", "لا تتوفر لدي تفاصيل شحن مؤكدة حالياً. دعني أوصلك بدعم CELIBERY.", isArabic),
          needsHumanHandoff: true,
        };
      } else {
        const lines = zones.flatMap((zone) => zone.methods.map((m) => {
          const name = isArabic ? m.nameAr : m.name;
          const free = m.freeThreshold != null ? t(` (free over SAR ${m.freeThreshold})`, ` (مجاني فوق ${m.freeThreshold} ر.س)`, isArabic) : "";
          return `${name}: SAR ${m.price}${free}, ${m.minDays}-${m.maxDays} ${t("days", "أيام", isArabic)}`;
        }));
        result = { ...base, message: lines.join(" · ") };
      }
      break;
    }

    case "warranty_returns": {
      const category = /return|refund|exchange|إرجاع|استرجاع/.test(message.toLowerCase()) ? "Returns" : "Warranty";
      const articles = await getKnowledge({ category, locale });
      if (articles.length === 0) {
        result = {
          ...base,
          message: t("I don't have confirmed warranty/return policy details published yet. Let me connect you with CELIBERY support.", "لا تتوفر لدي تفاصيل مؤكدة لسياسة الضمان أو الإرجاع حالياً. دعني أوصلك بدعم CELIBERY.", isArabic),
          needsHumanHandoff: true,
        };
      } else {
        result = { ...base, message: articles[0].body };
      }
      break;
    }

    case "faq": {
      const faqs = await getFaq({ query: message, locale });
      if (faqs.length === 0) {
        result = { ...base, message: t("I don't have a confirmed answer for that yet. Let me connect you with CELIBERY support.", "لا تتوفر لدي إجابة مؤكدة لذلك حالياً. دعني أوصلك بدعم CELIBERY.", isArabic), needsHumanHandoff: true };
      } else {
        result = { ...base, message: faqs[0].answer };
      }
      break;
    }

    case "support_handoff": {
      await createSupportRequest({ subject: message.slice(0, 150) || "Chat support request", category: "General", chatSessionId: sessionId });
      result = {
        ...base,
        message: t("I've created a support request for you — the CELIBERY team will follow up by email.", "لقد أنشأت طلب دعم لك — سيتواصل معك فريق CELIBERY عبر البريد الإلكتروني.", isArabic),
        needsHumanHandoff: true,
      };
      break;
    }

    default: {
      const faqs = await getFaq({ query: message, locale });
      if (faqs.length > 0) {
        result = { ...base, message: faqs[0].answer, suggestedReplies: [t("Find my perfect product", "اعثر على المنتج المناسب", isArabic)] };
      } else {
        result = {
          ...base,
          message: t("I want to make sure I get this right — could you tell me a bit more, or would you like to browse products or talk to support?", "أريد التأكد من فهمي الصحيح — هل يمكنك توضيح أكثر، أم تفضل تصفح المنتجات أو التواصل مع الدعم؟", isArabic),
          suggestedReplies: [t("Find my perfect product", "اعثر على المنتج المناسب", isArabic), t("Contact support", "تواصل مع الدعم", isArabic)],
        };
      }
    }
  }

  await saveContext(sessionId, nextContext);

  if (retrievedContext) {
    const fallbackMessage = result.message;
    const { text } = await generateMessage({ history, message, retrievedContext, fallbackMessage, locale });
    result = { ...result, message: text };
  }

  return result;
}
