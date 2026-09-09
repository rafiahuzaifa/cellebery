"use client";

import { MessageSquare, MessagesSquare, ShoppingBag, LifeBuoy, GitCompare, TrendingUp } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { StatCard } from "@/components/admin/stat-card";
import type { ChatbotStats } from "@/actions/chatbot-analytics";

const INTENT_LABELS: Record<string, { en: string; ar: string }> = {
  product_discovery: { en: "Product discovery", ar: "اكتشاف المنتجات" },
  product_question: { en: "Product questions", ar: "أسئلة المنتج" },
  comparison: { en: "Comparisons", ar: "مقارنات" },
  cart_action: { en: "Cart actions", ar: "إجراءات السلة" },
  order_status: { en: "Order status", ar: "حالة الطلب" },
  shipping: { en: "Shipping", ar: "الشحن" },
  warranty_returns: { en: "Warranty & returns", ar: "الضمان والإرجاع" },
  faq: { en: "FAQ", ar: "الأسئلة الشائعة" },
  support_handoff: { en: "Support handoff", ar: "تحويل للدعم" },
  greeting: { en: "Greetings", ar: "تحيات" },
  unknown: { en: "Unclassified", ar: "غير مصنف" },
};

const EVENT_LABELS: Record<string, { en: string; ar: string }> = {
  chat_opened: { en: "Chats opened", ar: "محادثات مفتوحة" },
  product_recommended: { en: "Products recommended", ar: "منتجات موصى بها" },
  product_clicked: { en: "Product clicks", ar: "نقرات على المنتج" },
  product_added_to_cart: { en: "Added to cart", ar: "أضيف للسلة" },
  comparison_started: { en: "Comparisons started", ar: "مقارنات بدأت" },
  order_lookup: { en: "Order lookups", ar: "بحث عن طلبات" },
  support_handoff: { en: "Support handoffs", ar: "تحويلات للدعم" },
};

export function ChatbotDashboard({ stats }: { stats: ChatbotStats }) {
  const { isArabic } = useLocale();
  const t = (en: string, ar: string) => (isArabic ? ar : en);

  const productClicks = stats.eventCounts.product_clicked ?? 0;
  const addedToCart = stats.eventCounts.product_added_to_cart ?? 0;
  const recommended = stats.eventCounts.product_recommended ?? 0;
  const conversionRate = recommended > 0 ? Math.round((addedToCart / recommended) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{t("CELIBERY AI", "CELIBERY AI")}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{t("Chatbot analytics", "تحليلات المساعد")}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={MessagesSquare} label={t("Total conversations", "إجمالي المحادثات")} value={stats.totalConversations.toString()} />
        <StatCard icon={MessageSquare} label={t("Today", "اليوم")} value={stats.conversationsToday.toString()} />
        <StatCard icon={TrendingUp} label={t("Avg. messages / chat", "متوسط الرسائل / محادثة")} value={stats.avgMessagesPerConversation.toString()} />
        <StatCard icon={GitCompare} label={t("Comparisons started", "مقارنات بدأت")} value={(stats.eventCounts.comparison_started ?? 0).toString()} />
        <StatCard icon={ShoppingBag} label={t("Rec. → cart rate", "نسبة التوصية إلى السلة")} value={`${conversionRate}%`} />
        <StatCard icon={LifeBuoy} label={t("Human handoffs", "تحويلات للدعم البشري")} value={stats.humanHandoffs.toString()} tone={stats.humanHandoffs > 0 ? "alert" : "default"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{t("Most asked about", "الأكثر سؤالاً عنه")}</h2>
          {stats.mostAskedIntents.length === 0 ? (
            <p className="py-6 text-center text-xs text-white/35">{t("No conversations yet", "لا توجد محادثات بعد")}</p>
          ) : (
            <ul className="space-y-3">
              {stats.mostAskedIntents.map(({ intent, count }) => {
                const label = INTENT_LABELS[intent] ?? { en: intent, ar: intent };
                const max = stats.mostAskedIntents[0].count;
                return (
                  <li key={intent}>
                    <div className="mb-1 flex items-center justify-between text-xs"><span className="text-white/75">{isArabic ? label.ar : label.en}</span><span className="text-white/40">{count}</span></div>
                    <div className="h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-[#22d3ee]" style={{ width: `${Math.max(6, (count / max) * 100)}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{t("Engagement funnel", "قمع التفاعل")}</h2>
          <ul className="space-y-3 text-xs">
            {Object.entries(EVENT_LABELS).map(([key, label]) => (
              <li key={key} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                <span className="text-white/60">{isArabic ? label.ar : label.en}</span>
                <span className="font-semibold text-white/85">{stats.eventCounts[key] ?? 0}</span>
              </li>
            ))}
          </ul>
          {productClicks > 0 && addedToCart === 0 && (
            <p className="mt-3 text-[10px] text-amber-300/80">{t("Customers are clicking products but not adding to cart yet.", "العملاء ينقرون على المنتجات لكن لا يضيفونها للسلة بعد.")}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
        <h2 className="mb-4 text-sm font-semibold text-white/85">{t("Recent conversations", "المحادثات الأخيرة")}</h2>
        {stats.recentSessions.length === 0 ? (
          <p className="py-6 text-center text-xs text-white/35">{t("No conversations yet", "لا توجد محادثات بعد")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40">
                  <th className="pb-2 pr-4 font-medium">{t("Session", "الجلسة")}</th>
                  <th className="pb-2 pr-4 font-medium">{t("Language", "اللغة")}</th>
                  <th className="pb-2 pr-4 font-medium">{t("Messages", "الرسائل")}</th>
                  <th className="pb-2 pr-4 font-medium">{t("Last activity", "آخر نشاط")}</th>
                  <th className="pb-2 font-medium">{t("Handoff", "تحويل")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="py-2.5 pr-4 font-mono text-white/60">{session.id.slice(-8)}</td>
                    <td className="py-2.5 pr-4 text-white/60 uppercase">{session.language}</td>
                    <td className="py-2.5 pr-4 text-white/60">{session.messageCount}</td>
                    <td className="py-2.5 pr-4 text-white/40">{session.lastMessageAt ? new Date(session.lastMessageAt).toLocaleString(isArabic ? "ar-SA" : "en-US") : "—"}</td>
                    <td className="py-2.5">{session.handoff ? <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-300">{t("Yes", "نعم")}</span> : <span className="text-white/30">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
