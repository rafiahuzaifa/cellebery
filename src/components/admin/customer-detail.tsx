"use client";

import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import type { AdminCustomerDetail } from "@/actions/customers";

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

export function CustomerDetail({ customer }: { customer: AdminCustomerDetail }) {
  const { isArabic } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/customers" className="mb-3 inline-flex items-center gap-2 text-[11px] text-white/50 transition hover:text-white"><ArrowLeft size={13} /> {isArabic ? "العملاء" : "Customers"}</Link>
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">{customer.name || customer.email}</h1>
        <p className="mt-1 text-xs text-white/40">{customer.email} · {customer.phone || "—"} · {isArabic ? "انضم في" : "Joined"} {new Date(customer.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#101416] p-4">
          <p className="text-[10px] uppercase tracking-[0.1em] text-white/40">{isArabic ? "إجمالي الطلبات" : "Total orders"}</p>
          <p className="mt-2 text-2xl font-semibold">{customer.orderCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#101416] p-4">
          <p className="text-[10px] uppercase tracking-[0.1em] text-white/40">{isArabic ? "القيمة الدائمة" : "Lifetime value"}</p>
          <p className="mt-2 text-2xl font-semibold">SAR {customer.lifetimeValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "الطلبات" : "Orders"}</h2>
          {customer.orders.length === 0 ? (
            <p className="py-6 text-center text-xs text-white/35">{isArabic ? "لا توجد طلبات بعد." : "No orders yet."}</p>
          ) : (
            <div className="divide-y divide-white/5">
              {customer.orders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between py-3 text-xs transition hover:text-[#22d3ee]">
                  <div>
                    <p className="font-medium text-white/85">{order.number}</p>
                    <p className="text-white/40">{new Date(order.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/70">SAR {order.total}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${STATUS_TONE[order.status] ?? ""}`}>{order.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "العناوين المحفوظة" : "Saved addresses"}</h2>
          {customer.addresses.length === 0 ? (
            <p className="py-6 text-center text-xs text-white/35">{isArabic ? "لا توجد عناوين محفوظة." : "No saved addresses."}</p>
          ) : (
            <div className="space-y-3">
              {customer.addresses.map((address) => (
                <div key={address.id} className="text-xs">
                  <div className="flex items-center gap-1.5 text-white/85"><MapPin size={12} className="text-[#22d3ee]" /> {address.label || (isArabic ? "عنوان" : "Address")} {address.isDefault && <span className="text-[9px] uppercase text-[#22d3ee]">({isArabic ? "افتراضي" : "default"})</span>}</div>
                  <p className="mt-1 pl-4 leading-5 text-white/50">{address.recipientName}<br />{address.street}, {address.city}, {address.region}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
