"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, ArrowDown, ArrowUp, Plus, Save, Trash2, X } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import {
  upsertHeroCampaignAction,
  deleteHeroCampaignAction,
  toggleHeroCampaignStatusAction,
  reorderHeroCampaignAction,
  type AdminHeroCampaign,
  type HeroProductOption,
} from "@/actions/hero-campaigns";

function blankCampaign(nextSortOrder: number): AdminHeroCampaign {
  return {
    id: "", title: "", titleAr: "", description: "", descriptionAr: "",
    desktopVideo: "", mobileVideo: "", posterImage: "",
    ctaText: "", ctaTextAr: "", ctaLink: "/shop",
    secondaryText: "", secondaryTextAr: "", secondaryLink: "",
    features: [], productId: "", sortOrder: nextSortOrder, isActive: true, startDate: "", endDate: "",
  };
}

export function HeroCampaignsManager({ campaigns, productOptions }: { campaigns: AdminHeroCampaign[]; productOptions: HeroProductOption[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<AdminHeroCampaign | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const result = await upsertHeroCampaignAction(editing);
      if (result.error) { setError(result.error); return; }
      setEditing(null);
      router.refresh();
    });
  };

  const runAction = (action: () => Promise<unknown>) => startTransition(async () => { await action(); router.refresh(); });

  const addFeature = () => { if (!editing) return; setEditing({ ...editing, features: [...editing.features, { en: "", ar: "" }] }); };
  const updateFeature = (i: number, key: "en" | "ar", value: string) => {
    if (!editing) return;
    const features = editing.features.map((f, idx) => (idx === i ? { ...f, [key]: value } : f));
    setEditing({ ...editing, features });
  };
  const removeFeature = (i: number) => { if (!editing) return; setEditing({ ...editing, features: editing.features.filter((_, idx) => idx !== i) }); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "الصفحة الرئيسية" : "Homepage"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "حملات البطل" : "Hero Campaigns"}</h1>
          <p className="mt-1 text-xs text-white/40">{isArabic ? "الشرائح المعروضة في قسم البطل بالصفحة الرئيسية." : "The rotating slides shown in the homepage hero carousel."}</p>
        </div>
        <button onClick={() => { setEditing(blankCampaign(campaigns.length)); setError(null); }} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white">
          <Plus size={14} /> {isArabic ? "حملة جديدة" : "New campaign"}
        </button>
      </div>

      {campaigns.length === 0 && !editing && (
        <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لا توجد حملات بعد." : "No campaigns yet — the homepage hero will show nothing until one is added."}</p>
        </div>
      )}

      <div className="space-y-3">
        {campaigns.map((c, i) => (
          <div key={c.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#101416] p-4">
            <div className="h-16 w-24 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-white/10" style={{ backgroundImage: c.posterImage ? `url(${c.posterImage})` : undefined }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white/90">{c.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-white/40">{c.ctaText} → {c.ctaLink}{c.desktopVideo ? " · video" : " · poster only"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button disabled={isPending || i === 0} onClick={() => runAction(() => reorderHeroCampaignAction(c.id, "up"))} className="grid size-8 place-items-center rounded-md border border-white/15 text-white/50 transition hover:border-white/40 disabled:opacity-30"><ArrowUp size={13} /></button>
              <button disabled={isPending || i === campaigns.length - 1} onClick={() => runAction(() => reorderHeroCampaignAction(c.id, "down"))} className="grid size-8 place-items-center rounded-md border border-white/15 text-white/50 transition hover:border-white/40 disabled:opacity-30"><ArrowDown size={13} /></button>
              <button disabled={isPending} onClick={() => runAction(() => toggleHeroCampaignStatusAction(c.id))} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${c.isActive ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-white/40"}`}>{c.isActive ? (isArabic ? "نشط" : "Active") : (isArabic ? "متوقف" : "Paused")}</button>
              <button onClick={() => { setEditing(c); setError(null); }} className="border border-white/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/70 transition hover:border-white/40">{isArabic ? "تعديل" : "Edit"}</button>
              <button disabled={isPending} onClick={() => { if (confirm(isArabic ? "حذف هذه الحملة؟" : "Delete this campaign?")) runAction(() => deleteHeroCampaignAction(c.id)); }} className="grid size-8 shrink-0 place-items-center border border-white/15 text-white/50 transition hover:border-red-400/40 hover:text-red-300"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="max-w-3xl rounded-xl border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{editing.id ? (isArabic ? "تعديل الحملة" : "Edit campaign") : (isArabic ? "حملة جديدة" : "New campaign")}</h2>
          {error && <p className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300"><AlertCircle size={13} /> {error}</p>}

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title (EN)"><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="admin-input" placeholder="SOUND WITHOUT LIMITS" /></Field>
              <Field label="العنوان (AR)"><input dir="rtl" value={editing.titleAr} onChange={(e) => setEditing({ ...editing, titleAr: e.target.value })} className="admin-input" placeholder="صوت بلا حدود" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Description (EN)"><textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="admin-input resize-none" /></Field>
              <Field label="الوصف (AR)"><textarea dir="rtl" value={editing.descriptionAr} onChange={(e) => setEditing({ ...editing, descriptionAr: e.target.value })} rows={2} className="admin-input resize-none" /></Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Desktop video URL (optional)"><input value={editing.desktopVideo} onChange={(e) => setEditing({ ...editing, desktopVideo: e.target.value })} className="admin-input font-mono text-xs" placeholder="/product-video.mp4" /></Field>
              <Field label="Mobile video URL (optional)"><input value={editing.mobileVideo} onChange={(e) => setEditing({ ...editing, mobileVideo: e.target.value })} className="admin-input font-mono text-xs" placeholder="/product-video-mobile.mp4" /></Field>
              <Field label="Poster image (required — fallback)"><input value={editing.posterImage} onChange={(e) => setEditing({ ...editing, posterImage: e.target.value })} className="admin-input font-mono text-xs" placeholder="/products/x7-pro-hero.jpg" /></Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary CTA text (EN)"><input value={editing.ctaText} onChange={(e) => setEditing({ ...editing, ctaText: e.target.value })} className="admin-input" placeholder="SHOP HEADPHONES" /></Field>
              <Field label="نص الزر الأساسي (AR)"><input dir="rtl" value={editing.ctaTextAr} onChange={(e) => setEditing({ ...editing, ctaTextAr: e.target.value })} className="admin-input" /></Field>
            </div>
            <Field label="Primary CTA link"><input value={editing.ctaLink} onChange={(e) => setEditing({ ...editing, ctaLink: e.target.value })} className="admin-input font-mono text-xs" placeholder="/shop?category=headphones" /></Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Secondary CTA text (EN, optional)"><input value={editing.secondaryText} onChange={(e) => setEditing({ ...editing, secondaryText: e.target.value })} className="admin-input" placeholder="EXPLORE COLLECTION" /></Field>
              <Field label="نص الزر الثانوي (AR)"><input dir="rtl" value={editing.secondaryTextAr} onChange={(e) => setEditing({ ...editing, secondaryTextAr: e.target.value })} className="admin-input" /></Field>
            </div>
            <Field label="Secondary CTA link"><input value={editing.secondaryLink} onChange={(e) => setEditing({ ...editing, secondaryLink: e.target.value })} className="admin-input font-mono text-xs" placeholder="/shop" /></Field>

            <Field label={isArabic ? "ربط بمنتج (اختياري)" : "Link a product (optional)"}>
              <select value={editing.productId} onChange={(e) => setEditing({ ...editing, productId: e.target.value })} className="admin-input">
                <option value="">{isArabic ? "بدون ربط" : "No product link"}</option>
                {productOptions.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "الميزات" : "Feature badges"}</span>
                <button type="button" onClick={addFeature} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#22d3ee] hover:text-white"><Plus size={12} /> {isArabic ? "إضافة" : "Add"}</button>
              </div>
              <div className="space-y-2">
                {editing.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={f.en} onChange={(e) => updateFeature(i, "en", e.target.value)} className="admin-input flex-1" placeholder="Hi-Fi Sound" />
                    <input dir="rtl" value={f.ar} onChange={(e) => updateFeature(i, "ar", e.target.value)} className="admin-input flex-1" placeholder="صوت عالي الدقة" />
                    <button type="button" onClick={() => removeFeature(i)} className="grid size-9 shrink-0 place-items-center text-white/40 hover:text-red-300"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={isArabic ? "يبدأ في (اختياري)" : "Starts on (optional)"}><input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} className="admin-input" /></Field>
              <Field label={isArabic ? "ينتهي في (اختياري)" : "Ends on (optional)"}><input type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} className="admin-input" /></Field>
              <label className="flex items-center gap-2 self-end pb-2.5 text-xs text-white/60"><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> {isArabic ? "نشط" : "Active"}</label>
            </div>
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
