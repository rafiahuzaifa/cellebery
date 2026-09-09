"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale } from "@/components/locale-provider";
import { StatCard } from "@/components/admin/stat-card";
import { CreditCard, ShoppingBag, Target } from "lucide-react";
import type { DashboardStats } from "@/actions/dashboard";

export function AnalyticsOverview({ stats }: { stats: DashboardStats }) {
  const { isArabic } = useLocale();
  const aov = stats.orders7d > 0 ? Math.round(stats.revenue7d / stats.orders7d) : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "الأداء" : "Performance"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "التحليلات" : "Analytics"}</h1>
        <p className="mt-1 text-xs text-white/40">{isArabic ? "آخر ٧ أيام من الطلبات الفعلية." : "Last 7 days of real order activity."}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={CreditCard} label={isArabic ? "الإيرادات (٧ أيام)" : "Revenue (7d)"} value={`SAR ${stats.revenue7d.toLocaleString()}`} change={stats.revenueChangePct ?? undefined} />
        <StatCard icon={ShoppingBag} label={isArabic ? "الطلبات (٧ أيام)" : "Orders (7d)"} value={stats.orders7d.toString()} change={stats.ordersChangePct ?? undefined} />
        <StatCard icon={Target} label={isArabic ? "متوسط قيمة الطلب" : "Avg. order value"} value={`SAR ${aov}`} />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
        <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "الطلبات اليومية" : "Daily orders"}</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0a0d0f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="orders" fill="#22d3ee" radius={4} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
