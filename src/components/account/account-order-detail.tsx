"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import type { CustomerOrderDetail } from "@/actions/account";

export function AccountOrderDetail({ order, locale }: { order: CustomerOrderDetail; locale: string }) {
  const { isArabic } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/${locale}/account/orders`} className="mb-3 inline-flex items-center gap-2 text-[11px] text-white/50 transition hover:text-white"><ArrowLeft size={13} /> {isArabic ? "طلباتي" : "My orders"}</Link>
        <h1 className="display-font text-4xl font-semibold uppercase leading-[0.9]">{order.number}</h1>
        <p className="mt-2 text-xs text-white/40">{new Date(order.createdAt).toLocaleString(isArabic ? "ar-SA" : "en-US")} · <span className="text-[#22d3ee]">{order.status}</span></p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "المنتجات" : "Items"}</h2>
          <div className="divide-y divide-white/5">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 text-xs">
                <div><p className="font-medium text-white/85">{item.name}</p><p className="text-white/40">{item.sku} × {item.quantity}</p></div>
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

        <div className="space-y-5">
          <div className="border border-white/10 bg-[#101416] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "عنوان الشحن" : "Shipping address"}</h2>
            {order.address ? (
              <p className="text-xs leading-6 text-white/60">{order.address.street}<br />{order.address.city}, {order.address.region}</p>
            ) : <p className="text-xs text-white/40">{isArabic ? "لا يوجد عنوان" : "No address on file"}</p>}
          </div>

          <div className="border border-white/10 bg-[#101416] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "سجل الحالة" : "Status history"}</h2>
            <div className="space-y-2">
              {order.statusHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-white/75">{entry.status}</span>
                  <span className="text-white/40">{new Date(entry.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
