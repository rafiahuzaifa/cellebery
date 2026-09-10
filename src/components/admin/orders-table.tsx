"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useLocale } from "@/components/locale-provider";
import { updateOrderStatusAction, type AdminOrder } from "@/actions/orders";
import type { OrderStatus } from "@prisma/client";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"];

const STATUS_TONE: Record<OrderStatus, string> = {
  PENDING: "text-amber-300 bg-amber-500/10",
  CONFIRMED: "text-[#22d3ee] bg-[#22d3ee]/10",
  PROCESSING: "text-[#22d3ee] bg-[#22d3ee]/10",
  SHIPPED: "text-sky-300 bg-sky-500/10",
  OUT_FOR_DELIVERY: "text-sky-300 bg-sky-500/10",
  DELIVERED: "text-emerald-300 bg-emerald-500/10",
  CANCELLED: "text-red-300 bg-red-500/10",
  RETURNED: "text-red-300 bg-red-500/10",
};

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const changeStatus = (orderId: string, status: OrderStatus) => {
    startTransition(async () => {
      await updateOrderStatusAction(orderId, status);
      router.refresh();
    });
  };

  const header = (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "المبيعات" : "Sales"}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "الطلبات" : "Orders"}</h1>
      <p className="mt-1 text-xs text-white/40">{orders.length} {isArabic ? "طلب إجمالاً" : "orders total"}</p>
    </div>
  );

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لا توجد طلبات بعد." : "No orders yet."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101416]">
      <table className="w-full min-w-[820px] text-left text-xs">
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
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-3 font-medium text-white/85">
                <Link href={`/admin/orders/${order.id}`} className="hover:text-[#22d3ee]">{order.number}</Link>
                {order.status === "PENDING" && order.paymentStatus === "PENDING" && (
                  <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase text-amber-300">{isArabic ? "بانتظار الدفع" : "Awaiting payment"}</span>
                )}
              </td>
              <td className="px-4 py-3 text-white/60">{order.customerName}</td>
              <td className="px-4 py-3 text-white/60">{order.city || "—"}</td>
              <td className="px-4 py-3 text-white/60">SAR {order.total}</td>
              <td className="px-4 py-3">
                <select
                  value={order.status}
                  disabled={isPending}
                  onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                  className={`rounded-full border-0 px-2 py-1 text-[10px] font-semibold outline-none disabled:opacity-50 ${STATUS_TONE[order.status]}`}
                >
                  {STATUS_OPTIONS.map((status) => <option key={status} value={status} className="bg-[#101416] text-white">{status}</option>)}
                </select>
              </td>
              <td className="px-4 py-3 text-white/40">{new Date(order.createdAt).toLocaleString(isArabic ? "ar-SA" : "en-US")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
