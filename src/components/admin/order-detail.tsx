"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { updateOrderStatusAction, type AdminOrderDetail } from "@/actions/orders";
import type { OrderStatus } from "@prisma/client";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"];

export function OrderDetail({ order }: { order: AdminOrderDetail }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const changeStatus = (status: OrderStatus) => {
    startTransition(async () => {
      await updateOrderStatusAction(order.id, status);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-2 text-[11px] text-white/50 transition hover:text-white"><ArrowLeft size={13} /> {isArabic ? "الطلبات" : "Orders"}</Link>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">{order.number}</h1>
          <p className="mt-1 text-xs text-white/40">{new Date(order.createdAt).toLocaleString(isArabic ? "ar-SA" : "en-US")}</p>
        </div>
        <select
          value={order.status}
          disabled={isPending}
          onChange={(e) => changeStatus(e.target.value as OrderStatus)}
          className="admin-input w-auto"
        >
          {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "المنتجات" : "Items"}</h2>
            <div className="divide-y divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 text-xs">
                  <div>
                    <p className="font-medium text-white/85">{item.name}</p>
                    <p className="text-white/40">{item.sku} × {item.quantity}</p>
                  </div>
                  <span className="text-white/70">SAR {item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-white/60">
              <div className="flex justify-between"><span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span><span>SAR {order.subtotal}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-[#22d3ee]"><span>{isArabic ? "الخصم" : "Discount"}</span><span>- SAR {order.discount}</span></div>}
              <div className="flex justify-between"><span>{isArabic ? "الشحن" : "Shipping"}</span><span>{order.shipping === 0 ? (isArabic ? "مجاني" : "Free") : `SAR ${order.shipping}`}</span></div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-sm text-white"><span>{isArabic ? "الإجمالي" : "Total"}</span><span>SAR {order.total}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "سجل الحالة" : "Status history"}</h2>
            <div className="space-y-3">
              {order.statusHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-white/75">{entry.status}</span>
                  <span className="text-white/40">{new Date(entry.createdAt).toLocaleString(isArabic ? "ar-SA" : "en-US")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "العميل" : "Customer"}</h2>
            <div className="space-y-2 text-xs text-white/60">
              <p className="text-white/85">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "عنوان الشحن" : "Shipping address"}</h2>
            {order.address ? (
              <div className="space-y-1 text-xs text-white/60">
                <p>{order.address.street}</p>
                {order.address.district && <p>{order.address.district}</p>}
                <p>{order.address.city}, {order.address.region}</p>
              </div>
            ) : <p className="text-xs text-white/40">{isArabic ? "لا يوجد عنوان" : "No address on file"}</p>}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "الدفع" : "Payment"}</h2>
            {order.payment ? (
              <div className="space-y-2 text-xs text-white/60">
                <div className="flex justify-between"><span>{isArabic ? "المزود" : "Provider"}</span><span className="text-white/85">{order.payment.provider}</span></div>
                <div className="flex justify-between"><span>{isArabic ? "الحالة" : "Status"}</span><span className="text-white/85">{order.payment.status}</span></div>
                {order.payment.providerPaymentId && <div className="flex justify-between"><span>{isArabic ? "المرجع" : "Reference"}</span><span className="truncate text-white/85">{order.payment.providerPaymentId}</span></div>}
              </div>
            ) : <p className="text-xs text-white/40">{isArabic ? "لا توجد بيانات دفع" : "No payment record"}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
