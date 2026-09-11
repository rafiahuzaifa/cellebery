"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, ArrowUpRight, Save } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { updateCustomerProfileAction, type AccountFormState, type CustomerOrder } from "@/actions/account";

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

export function AccountDashboard({ name, phone, recentOrders, locale }: { name: string; phone: string; recentOrders: CustomerOrder[]; locale: string }) {
  const { isArabic } = useLocale();
  const [state, formAction, pending] = useActionState<AccountFormState, FormData>(updateCustomerProfileAction, undefined);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "حسابي" : "My Account"}</p>
        <h1 className="display-font mt-2 text-4xl font-semibold uppercase leading-[0.9]">{isArabic ? "لوحة التحكم" : "Dashboard"}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "الملف الشخصي" : "Profile"}</h2>
          <form action={formAction} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "الاسم الكامل" : "Full name"}</span>
              <input name="name" defaultValue={name} className="w-full border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#22d3ee]" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "رقم الجوال" : "Mobile number"}</span>
              <input name="phone" defaultValue={phone} className="w-full border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#22d3ee]" />
            </label>
            {state?.error && <p className="flex items-center gap-2 border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300"><AlertCircle size={13} /> {state.error}</p>}
            <button type="submit" disabled={pending} className="flex items-center gap-2 rounded-full bg-[#22d3ee] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#080a0c] transition hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-60 disabled:shadow-none">
              <Save size={13} /> {pending ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : (isArabic ? "حفظ" : "Save")}
            </button>
          </form>
        </div>

        <div className="border border-white/10 bg-[#101416] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/85">{isArabic ? "الطلبات الأخيرة" : "Recent orders"}</h2>
            <Link href={`/${locale}/account/orders`} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#22d3ee]">{isArabic ? "عرض الكل" : "View all"} <ArrowUpRight size={12} /></Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-xs text-white/40">{isArabic ? "لا توجد طلبات بعد." : "No orders yet."}</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <Link key={order.id} href={`/${locale}/account/orders/${order.id}`} className="flex items-center justify-between border-b border-white/5 pb-3 text-xs transition hover:text-[#22d3ee]">
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
      </div>
    </div>
  );
}
