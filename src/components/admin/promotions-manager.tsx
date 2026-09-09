"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, Calendar, Plus, Save, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import {
  upsertAdminPromotionAction,
  deleteAdminPromotionAction,
  toggleAdminPromotionStatusAction,
  type AdminPromotion,
  type PromotionOption,
} from "@/actions/promotions";

function blankPromotion(): AdminPromotion {
  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  return { id: "", name: "", startsAt: today, endsAt: nextWeek, active: true, productIds: [], categoryIds: [] };
}

export function PromotionsManager({ promotions, productOptions, categoryOptions }: { promotions: AdminPromotion[]; productOptions: PromotionOption[]; categoryOptions: PromotionOption[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<AdminPromotion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const result = await upsertAdminPromotionAction(editing);
      if (result.error) { setError(result.error); return; }
      setEditing(null);
      router.refresh();
    });
  };

  const runAction = (action: () => Promise<unknown>) => startTransition(async () => { await action(); router.refresh(); });

  const isLive = (promotion: AdminPromotion) => {
    const now = new Date();
    return promotion.active && new Date(promotion.startsAt) <= now && now <= new Date(promotion.endsAt);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "التسويق" : "Marketing"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "العروض" : "Promotions"}</h1>
        </div>
        <button onClick={() => { setEditing(blankPromotion()); setError(null); }} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white">
          <Plus size={14} /> {isArabic ? "عرض جديد" : "New promotion"}
        </button>
      </div>

      {promotions.length === 0 && !editing && (
        <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لا توجد عروض بعد." : "No promotions yet."}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {promotions.map((promotion) => (
          <div key={promotion.id} className="rounded-xl border border-white/10 bg-[#101416] p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-white/90">{promotion.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/40"><Calendar size={11} /> {promotion.startsAt} → {promotion.endsAt}</p>
              </div>
              {isLive(promotion) && <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase text-emerald-300">{isArabic ? "مباشر الآن" : "Live now"}</span>}
            </div>
            <p className="mt-3 text-[11px] text-white/45">{promotion.productIds.length} {isArabic ? "منتج" : "products"} · {promotion.categoryIds.length} {isArabic ? "فئة" : "categories"}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setEditing(promotion); setError(null); }} className="flex-1 border border-white/15 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/70 transition hover:border-white/40">{isArabic ? "تعديل" : "Edit"}</button>
              <button disabled={isPending} onClick={() => runAction(() => toggleAdminPromotionStatusAction(promotion.id))} className={`px-3 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${promotion.active ? "text-[#22d3ee]" : "text-white/40"}`}>{promotion.active ? (isArabic ? "نشط" : "Active") : (isArabic ? "متوقف" : "Paused")}</button>
              <button disabled={isPending} onClick={() => { if (confirm(isArabic ? "حذف هذا العرض؟" : "Delete this promotion?")) runAction(() => deleteAdminPromotionAction(promotion.id)); }} className="grid size-9 shrink-0 place-items-center border border-white/15 text-white/50 transition hover:border-red-400/40 hover:text-red-300"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="max-w-2xl rounded-xl border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{editing.id ? (isArabic ? "تعديل العرض" : "Edit promotion") : (isArabic ? "عرض جديد" : "New promotion")}</h2>
          {error && <p className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300"><AlertCircle size={13} /> {error}</p>}
          <div className="space-y-4">
            <Field label={isArabic ? "اسم العرض" : "Promotion name"}><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="admin-input" placeholder={isArabic ? "تخفيضات نهاية الموسم" : "End of season sale"} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={isArabic ? "يبدأ في" : "Starts on"}><input type="date" value={editing.startsAt} onChange={(e) => setEditing({ ...editing, startsAt: e.target.value })} className="admin-input" /></Field>
              <Field label={isArabic ? "ينتهي في" : "Ends on"}><input type="date" value={editing.endsAt} onChange={(e) => setEditing({ ...editing, endsAt: e.target.value })} className="admin-input" /></Field>
            </div>
            <label className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> {isArabic ? "نشط" : "Active"}</label>

            <Field label={isArabic ? "الفئات المشمولة" : "Categories included"}>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => {
                  const selected = editing.categoryIds.includes(option.id);
                  return (
                    <button key={option.id} type="button" onClick={() => setEditing({ ...editing, categoryIds: selected ? editing.categoryIds.filter((id) => id !== option.id) : [...editing.categoryIds, option.id] })} className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${selected ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/15 text-white/50"}`}>{option.label}</button>
                  );
                })}
              </div>
            </Field>

            <Field label={isArabic ? "المنتجات المشمولة" : "Products included"}>
              <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                {productOptions.map((option) => {
                  const selected = editing.productIds.includes(option.id);
                  return (
                    <button key={option.id} type="button" onClick={() => setEditing({ ...editing, productIds: selected ? editing.productIds.filter((id) => id !== option.id) : [...editing.productIds, option.id] })} className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${selected ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/15 text-white/50"}`}>{option.label}</button>
                  );
                })}
              </div>
            </Field>
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={save} disabled={isPending} className="flex items-center gap-2 bg-[#22d3ee] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#080a0c] transition hover:bg-white disabled:opacity-60"><Save size={13} /> {isPending ? "..." : (isArabic ? "حفظ" : "Save")}</button>
            <button onClick={() => setEditing(null)} className="border border-white/15 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60">{isArabic ? "إلغاء" : "Cancel"}</button>
          </div>
        </div>
      )}
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
