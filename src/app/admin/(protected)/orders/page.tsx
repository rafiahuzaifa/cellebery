"use client";

import { useLocale } from "@/components/locale-provider";
import { recentOrders } from "@/lib/admin/dashboard-data";

const statusTone: Record<string, string> = {
  Pending: "text-amber-300 bg-amber-500/10",
  Confirmed: "text-[#22d3ee] bg-[#22d3ee]/10",
  Shipped: "text-sky-300 bg-sky-500/10",
  Delivered: "text-emerald-300 bg-emerald-500/10",
  Cancelled: "text-red-300 bg-red-500/10",
};

export default function AdminOrdersPage() {
  const { isArabic } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "المبيعات" : "Sales"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "الطلبات" : "Orders"}</h1>
        <p className="mt-1 text-xs text-white/40">{isArabic ? "بيانات تجريبية إلى أن يتم ربط قاعدة البيانات." : "Sample data until the database is connected — see Section 34 order tracking in the spec."}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101416]">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/40">
              <th className="px-4 py-3 font-medium">{isArabic ? "الطلب" : "Order"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "العميل" : "Customer"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "المدينة" : "City"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "الإجمالي" : "Total"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "التاريخ" : "Date"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium text-white/85">{order.id}</td>
                <td className="px-4 py-3 text-white/60">{order.customer}</td>
                <td className="px-4 py-3 text-white/60">{order.city}</td>
                <td className="px-4 py-3 text-white/60">SAR {order.total}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone[order.status]}`}>{order.status}</span></td>
                <td className="px-4 py-3 text-white/40">{order.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
