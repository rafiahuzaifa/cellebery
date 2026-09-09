"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { upsertAdminCouponAction, type AdminCoupon } from "@/actions/coupons";

function blankCoupon(): AdminCoupon {
  return {
    id: "",
    code: "",
    type: "percentage",
    value: 10,
    minimumOrder: null,
    maximumDiscount: null,
    usageLimit: null,
    usageCount: 0,
    customerLimit: null,
    startsAt: null,
    expiresAt: null,
    active: true,
  };
}

export function CouponForm({ initial }: { initial?: AdminCoupon }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [coupon, setCoupon] = useState<AdminCoupon>(initial ?? blankCoupon());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isNew = !initial;

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await upsertAdminCouponAction(coupon);
      if (result.error) { setError(result.error); return; }
      router.push("/admin/coupons");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/coupons" className="mb-3 inline-flex items-center gap-2 text-[11px] text-white/50 transition hover:text-white"><ArrowLeft size={13} /> {isArabic ? "القسائم" : "Coupons"}</Link>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">{isNew ? (isArabic ? "قسيمة جديدة" : "New coupon") : (isArabic ? "تعديل القسيمة" : "Edit coupon")}</h1>
        </div>
        <button onClick={save} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
          <Save size={14} /> {isPending ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : (isArabic ? "حفظ" : "Save")}
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#101416] p-5 space-y-4">
          <Field label={isArabic ? "الرمز" : "Code"}>
            <input value={coupon.code} onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })} className="admin-input font-mono" placeholder="SAVE20" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={isArabic ? "نوع الخصم" : "Discount type"}>
              <select value={coupon.type} onChange={(e) => setCoupon({ ...coupon, type: e.target.value as AdminCoupon["type"] })} className="admin-input">
                <option value="percentage">{isArabic ? "نسبة مئوية" : "Percentage"}</option>
                <option value="fixed">{isArabic ? "قيمة ثابتة" : "Fixed amount"}</option>
              </select>
            </Field>
            <Field label={coupon.type === "percentage" ? (isArabic ? "النسبة %" : "Percent %") : (isArabic ? "القيمة (ر.س)" : "Value (SAR)")}>
              <input type="number" min={0} value={coupon.value} onChange={(e) => setCoupon({ ...coupon, value: Number(e.target.value) })} className="admin-input" />
            </Field>
          </div>
          <Field label={isArabic ? "الحالة" : "Status"}>
            <select value={coupon.active ? "active" : "inactive"} onChange={(e) => setCoupon({ ...coupon, active: e.target.value === "active" })} className="admin-input">
              <option value="active">{isArabic ? "نشطة" : "Active"}</option>
              <option value="inactive">{isArabic ? "غير نشطة" : "Inactive"}</option>
            </select>
          </Field>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#101416] p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label={isArabic ? "الحد الأدنى للطلب (ر.س)" : "Minimum order (SAR)"}>
              <input type="number" min={0} value={coupon.minimumOrder ?? ""} onChange={(e) => setCoupon({ ...coupon, minimumOrder: e.target.value ? Number(e.target.value) : null })} className="admin-input" placeholder={isArabic ? "بدون حد" : "No minimum"} />
            </Field>
            <Field label={isArabic ? "أقصى خصم (ر.س)" : "Max discount (SAR)"}>
              <input type="number" min={0} value={coupon.maximumDiscount ?? ""} onChange={(e) => setCoupon({ ...coupon, maximumDiscount: e.target.value ? Number(e.target.value) : null })} className="admin-input" placeholder={isArabic ? "بدون حد" : "No cap"} disabled={coupon.type === "fixed"} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={isArabic ? "حد الاستخدام الكلي" : "Total usage limit"}>
              <input type="number" min={0} value={coupon.usageLimit ?? ""} onChange={(e) => setCoupon({ ...coupon, usageLimit: e.target.value ? Number(e.target.value) : null })} className="admin-input" placeholder={isArabic ? "غير محدود" : "Unlimited"} />
            </Field>
            <Field label={isArabic ? "حد لكل عميل" : "Per-customer limit"}>
              <input type="number" min={0} value={coupon.customerLimit ?? ""} onChange={(e) => setCoupon({ ...coupon, customerLimit: e.target.value ? Number(e.target.value) : null })} className="admin-input" placeholder={isArabic ? "غير محدود" : "Unlimited"} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={isArabic ? "يبدأ في" : "Starts on"}>
              <input type="date" value={coupon.startsAt ?? ""} onChange={(e) => setCoupon({ ...coupon, startsAt: e.target.value || null })} className="admin-input" />
            </Field>
            <Field label={isArabic ? "ينتهي في" : "Expires on"}>
              <input type="date" value={coupon.expiresAt ?? ""} onChange={(e) => setCoupon({ ...coupon, expiresAt: e.target.value || null })} className="admin-input" />
            </Field>
          </div>
          {!isNew && <p className="text-[11px] text-white/35">{isArabic ? "مرات الاستخدام حتى الآن:" : "Used so far:"} {coupon.usageCount}</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{label}</span>
      {children}
    </label>
  );
}
