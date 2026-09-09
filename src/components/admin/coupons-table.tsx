"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { deleteAdminCouponAction, toggleAdminCouponStatusAction, type AdminCoupon } from "@/actions/coupons";

export function CouponsTable({ coupons }: { coupons: AdminCoupon[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(query.toLowerCase()));

  const runAction = (action: () => Promise<unknown>) => {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "التسويق" : "Marketing"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "القسائم" : "Coupons"}</h1>
        </div>
        <Link href="/admin/coupons/new" className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white">
          <Plus size={14} /> {isArabic ? "قسيمة جديدة" : "New coupon"}
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101416] px-4 py-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isArabic ? "بحث بالرمز" : "Search code"} className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30" />
        <span className="text-[11px] text-white/35">{filtered.length} {isArabic ? "قسيمة" : "coupons"}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لا توجد قسائم بعد." : "No coupons yet."}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101416]">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40">
                <th className="px-4 py-3 font-medium">{isArabic ? "الرمز" : "Code"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الخصم" : "Discount"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الحد الأدنى" : "Min. order"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الاستخدام" : "Usage"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الانتهاء" : "Expires"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 font-medium text-end">{isArabic ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-4 py-3 font-mono font-medium text-white/85">{coupon.code}</td>
                  <td className="px-4 py-3 text-white/60">{coupon.type === "percentage" ? `${coupon.value}%` : `SAR ${coupon.value}`}</td>
                  <td className="px-4 py-3 text-white/60">{coupon.minimumOrder != null ? `SAR ${coupon.minimumOrder}` : "—"}</td>
                  <td className="px-4 py-3 text-white/60">{coupon.usageCount}{coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}</td>
                  <td className="px-4 py-3 text-white/60">{coupon.expiresAt ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      role="switch"
                      aria-checked={coupon.active}
                      disabled={isPending}
                      onClick={() => runAction(() => toggleAdminCouponStatusAction(coupon.id))}
                      className={`relative h-5 w-9 shrink-0 rounded-full transition disabled:opacity-50 ${coupon.active ? "bg-[#22d3ee]" : "bg-white/15"}`}
                    >
                      <span className={`absolute top-0.5 size-4 rounded-full bg-[#080a0c] transition ${coupon.active ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/coupons/${coupon.id}`} aria-label="Edit" className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"><Pencil size={14} /></Link>
                      <button aria-label="Delete" disabled={isPending} onClick={() => { if (confirm(isArabic ? "حذف هذه القسيمة؟" : "Delete this coupon?")) runAction(() => deleteAdminCouponAction(coupon.id)); }} className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
