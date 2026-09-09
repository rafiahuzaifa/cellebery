"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import type { CustomerOrder } from "@/actions/account";

const STATUS_TONE: Record<string, string> = {
  PENDING: "text-amber-300 bg-amber-500/10",
  CONFIRMED: "text-[#22d3ee] bg-[#22d3ee]/10",
  PROCESSING: "text-[#22d3ee] bg-[#22d3ee]/10",
  SHIPPED: "text-sky-300 bg-sky-500/10",
  OUT_FOR_DELIVERY: "text-sky-300 bg-sky-500/10",
  DELIVERED: "text-emerald-300 bg-emerald-500/10",
  CANCELLED: "text-red-300 bg-red-500/10",
  RETURNED: "text-red-300 bg-red-500/10",
};

export function AccountOrdersList({ orders, locale }: { orders: CustomerOrder[]; locale: string }) {
  const { isArabic } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "حسابي" : "My Account"}</p>
        <h1 className="display-font mt-2 text-4xl font-semibold uppercase leading-[0.9]">{isArabic ? "طلباتي" : "My Orders"}</h1>
      </div>

      {orders.length === 0 ? (
        <div className="border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لا توجد طلبات بعد." : "No orders yet."}</p>
          <Link href={`/${locale}/shop`} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#22d3ee]">{isArabic ? "تسوق الآن" : "Start shopping"}</Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/10 bg-[#101416]">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40">
                <th className="px-4 py-3 font-medium">{isArabic ? "الطلب" : "Order"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "التاريخ" : "Date"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "المنتجات" : "Items"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الإجمالي" : "Total"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><Link href={`/${locale}/account/orders/${order.id}`} className="font-medium text-white/85 hover:text-[#22d3ee]">{order.number}</Link></td>
                  <td className="px-4 py-3 text-white/50">{new Date(order.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</td>
                  <td className="px-4 py-3 text-white/50">{order.itemCount}</td>
                  <td className="px-4 py-3 text-white/70">SAR {order.total}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${STATUS_TONE[order.status] ?? ""}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
