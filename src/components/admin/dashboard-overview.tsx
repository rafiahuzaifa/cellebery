"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale } from "@/components/locale-provider";
import { StatCard } from "@/components/admin/stat-card";
import type { AdminProduct } from "@/lib/admin/catalog";
import type { DashboardStats } from "@/actions/dashboard";

const statusTone: Record<string, string> = {
  PENDING: "text-amber-300 bg-amber-500/10",
  CONFIRMED: "text-[#22d3ee] bg-[#22d3ee]/10",
  PROCESSING: "text-[#22d3ee] bg-[#22d3ee]/10",
  SHIPPED: "text-sky-300 bg-sky-500/10",
  OUT_FOR_DELIVERY: "text-sky-300 bg-sky-500/10",
  DELIVERED: "text-emerald-300 bg-emerald-500/10",
  CANCELLED: "text-red-300 bg-red-500/10",
  RETURNED: "text-red-300 bg-red-500/10",
};

export function DashboardOverview({ products, stats }: { products: AdminProduct[]; stats: DashboardStats }) {
  const { isArabic } = useLocale();

  const lowStock = products.filter((product) => product.stock <= product.lowStockThreshold);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "نظرة عامة" : "Overview"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "لوحة تحكم CELIBERY" : "CELIBERY dashboard"}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={TrendingUp} label={isArabic ? "مبيعات اليوم" : "Today's Sales"} value={`SAR ${stats.todaysSales.toLocaleString()}`} />
        <StatCard icon={TrendingUp} label={isArabic ? "الإيرادات (٧ أيام)" : "Revenue (7d)"} value={`SAR ${stats.revenue7d.toLocaleString()}`} change={stats.revenueChangePct ?? undefined} />
        <StatCard icon={ShoppingCart} label={isArabic ? "الطلبات (٧ أيام)" : "Orders (7d)"} value={stats.orders7d.toString()} change={stats.ordersChangePct ?? undefined} />
        <StatCard icon={Users} label={isArabic ? "العملاء" : "Customers"} value={stats.totalCustomers.toLocaleString()} />
        <StatCard icon={Package} label={isArabic ? "المنتجات المباعة (٧ أيام)" : "Products Sold (7d)"} value={stats.productsSold7d.toString()} />
        <StatCard icon={AlertTriangle} label={isArabic ? "مخزون منخفض" : "Low Stock"} value={lowStock.length.toString()} tone={lowStock.length > 0 ? "alert" : "default"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/85">{isArabic ? "نظرة على المبيعات" : "Sales Overview"}</h2>
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/35">{isArabic ? "آخر ٧ أيام" : "Last 7 days"}</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "#0a0d0f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#fff" }} />
                <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: "#22d3ee" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "المبيعات حسب المدينة" : "Sales by City"}</h2>
          <div className="h-64">
            {stats.salesByCity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.salesByCity} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="city" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} width={70} />
                  <Tooltip contentStyle={{ background: "#0a0d0f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="value" fill="#22d3ee" radius={4} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-white/35">{isArabic ? "لا توجد بيانات بعد" : "No data yet"}</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/85">{isArabic ? "الطلبات الأخيرة" : "Recent Orders"}</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#22d3ee]">{isArabic ? "عرض الكل" : "View all"} <ArrowUpRight size={12} /></Link>
          </div>
          {stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b border-white/10 text-white/40"><th className="pb-2 font-medium">{isArabic ? "الطلب" : "Order"}</th><th className="pb-2 font-medium">{isArabic ? "العميل" : "Customer"}</th><th className="pb-2 font-medium">{isArabic ? "الإجمالي" : "Total"}</th><th className="pb-2 font-medium">{isArabic ? "الحالة" : "Status"}</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-2.5 font-medium text-white/80"><Link href={`/admin/orders/${order.id}`} className="hover:text-[#22d3ee]">{order.number}</Link></td>
                      <td className="py-2.5 text-white/60">{order.customerName}</td>
                      <td className="py-2.5 text-white/60">SAR {order.total}</td>
                      <td className="py-2.5"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone[order.status]}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-white/35">{isArabic ? "لا توجد طلبات بعد" : "No orders yet"}</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/85">{isArabic ? "الأكثر مبيعاً" : "Top Products"}</h2>
            <Link href="/admin/products" className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#22d3ee]">{isArabic ? "إدارة" : "Manage"} <ArrowUpRight size={12} /></Link>
          </div>
          {stats.topProducts.length > 0 ? (
            <ul className="space-y-3">
              {stats.topProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-3">
                  <div className="size-10 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${product.image})` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white/85">{isArabic ? product.nameAr || product.nameEn : product.nameEn}</p>
                    <p className="text-[10px] text-white/40">{product.sold} {isArabic ? "مباع" : "sold"}</p>
                  </div>
                  <span className="text-xs text-white/60">SAR {product.salePrice ?? product.price}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-white/35">{isArabic ? "لا توجد مبيعات بعد" : "No sales yet"}</p>
          )}
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-300"><AlertTriangle size={15} /> {isArabic ? "تنبيه مخزون منخفض" : "Low stock alert"}</div>
          <div className="flex flex-wrap gap-3">
            {lowStock.map((product) => (
              <Link key={product.id} href={`/admin/products/${product.id}`} className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-[#101416] px-3 py-2 text-xs transition hover:border-red-400/50">
                <span className="text-white/80">{isArabic ? product.ar.name || product.en.name : product.en.name}</span>
                <span className="text-red-300">{product.stock} {isArabic ? "متبقي" : "left"}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
