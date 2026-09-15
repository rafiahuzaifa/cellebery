"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Star, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import {
  upsertAdminNavItemAction,
  deleteAdminNavItemAction,
  reorderAdminNavItemAction,
  toggleAdminNavItemEnabledAction,
  toggleAdminNavItemPrimaryAction,
  type AdminNavItem,
} from "@/actions/navigation";
import type { AdminCategoryRow } from "@/actions/categories";

function blankNavItem(nextSortOrder: number): AdminNavItem {
  return { id: "", labelEn: "", labelAr: "", linkType: "custom", customPath: "/shop", categoryId: "", sortOrder: nextSortOrder, enabled: true, showInPrimary: false };
}

export function NavigationManager({ items, categoryOptions }: { items: AdminNavItem[]; categoryOptions: AdminCategoryRow[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<AdminNavItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const result = await upsertAdminNavItemAction(editing);
      if (result.error) { setError(result.error); return; }
      setEditing(null);
      router.refresh();
    });
  };

  const runAction = (action: () => Promise<unknown>) => startTransition(async () => { await action(); router.refresh(); });

  const describeLink = (item: AdminNavItem) => {
    if (item.linkType === "category") {
      const category = categoryOptions.find((c) => c.id === item.categoryId);
      return `/shop?category=${category?.slug ?? "?"}`;
    }
    return item.customPath || "/shop";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "الصفحة الرئيسية" : "Storefront"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "التنقل" : "Navigation"}</h1>
          <p className="mt-1 text-xs text-white/40">{isArabic ? "روابط شريط التنقل العلوي وقائمة الجوال." : "The links shown in the top navbar and the mobile drawer."}</p>
        </div>
        <button onClick={() => { setEditing(blankNavItem(items.length)); setError(null); }} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white">
          <Plus size={14} /> {isArabic ? "رابط جديد" : "New link"}
        </button>
      </div>

      {error && !editing && (
        <p className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"><AlertCircle size={14} className="shrink-0" /> {error}</p>
      )}

      {items.length === 0 && !editing && (
        <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لا توجد روابط بعد." : "No nav links yet — the storefront navbar will be empty until one is added."}</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#101416] p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white/90">{item.labelEn} <span className="font-normal text-white/35">/ {item.labelAr}</span></p>
              <p className="mt-0.5 truncate font-mono text-[11px] text-white/40">{describeLink(item)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button disabled={isPending || i === 0} onClick={() => runAction(() => reorderAdminNavItemAction(item.id, "up"))} className="grid size-8 place-items-center rounded-md border border-white/15 text-white/50 transition hover:border-white/40 disabled:opacity-30"><ArrowUp size={13} /></button>
              <button disabled={isPending || i === items.length - 1} onClick={() => runAction(() => reorderAdminNavItemAction(item.id, "down"))} className="grid size-8 place-items-center rounded-md border border-white/15 text-white/50 transition hover:border-white/40 disabled:opacity-30"><ArrowDown size={13} /></button>
              <button
                disabled={isPending}
                title={isArabic ? "إظهار في الشريط العلوي" : "Show in desktop row"}
                onClick={() => runAction(() => toggleAdminNavItemPrimaryAction(item.id))}
                className={`grid size-8 place-items-center rounded-md border transition ${item.showInPrimary ? "border-[#22d3ee]/50 bg-[#22d3ee]/10 text-[#22d3ee]" : "border-white/15 text-white/40"}`}
              >
                <Star size={13} fill={item.showInPrimary ? "currentColor" : "none"} />
              </button>
              <button disabled={isPending} onClick={() => runAction(() => toggleAdminNavItemEnabledAction(item.id))} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${item.enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-white/40"}`}>
                {item.enabled ? <span className="flex items-center gap-1.5"><Eye size={12} /> {isArabic ? "ظاهر" : "Visible"}</span> : <span className="flex items-center gap-1.5"><EyeOff size={12} /> {isArabic ? "مخفي" : "Hidden"}</span>}
              </button>
              <button onClick={() => { setEditing(item); setError(null); }} className="border border-white/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/70 transition hover:border-white/40">{isArabic ? "تعديل" : "Edit"}</button>
              <button disabled={isPending} onClick={() => { if (confirm(isArabic ? "حذف هذا الرابط؟" : "Delete this link?")) runAction(() => deleteAdminNavItemAction(item.id)); }} className="grid size-8 shrink-0 place-items-center border border-white/15 text-white/50 transition hover:border-red-400/40 hover:text-red-300"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="max-w-2xl rounded-xl border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{editing.id ? (isArabic ? "تعديل الرابط" : "Edit link") : (isArabic ? "رابط جديد" : "New link")}</h2>
          {error && <p className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300"><AlertCircle size={13} /> {error}</p>}

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Label (EN)"><input value={editing.labelEn} onChange={(e) => setEditing({ ...editing, labelEn: e.target.value })} className="admin-input" placeholder="Shop" /></Field>
              <Field label="التسمية (AR)"><input dir="rtl" value={editing.labelAr} onChange={(e) => setEditing({ ...editing, labelAr: e.target.value })} className="admin-input text-right" placeholder="المتجر" /></Field>
            </div>

            <Field label={isArabic ? "نوع الرابط" : "Link type"}>
              <div className="flex gap-2 rounded-lg bg-white/5 p-1">
                <button type="button" onClick={() => setEditing({ ...editing, linkType: "custom" })} className={`flex-1 rounded-md px-4 py-1.5 text-xs font-semibold transition ${editing.linkType === "custom" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>{isArabic ? "رابط مخصص" : "Custom link"}</button>
                <button type="button" onClick={() => setEditing({ ...editing, linkType: "category" })} className={`flex-1 rounded-md px-4 py-1.5 text-xs font-semibold transition ${editing.linkType === "category" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>{isArabic ? "فئة" : "Category"}</button>
              </div>
            </Field>

            {editing.linkType === "category" ? (
              <Field label={isArabic ? "الفئة" : "Category"}>
                <select value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })} className="admin-input">
                  <option value="">{isArabic ? "اختر فئة" : "Choose a category"}</option>
                  {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.en.name || c.slug}</option>)}
                </select>
              </Field>
            ) : (
              <Field label={isArabic ? "المسار" : "Path"}>
                <input value={editing.customPath} onChange={(e) => setEditing({ ...editing, customPath: e.target.value })} className="admin-input font-mono text-xs" placeholder="/shop, /blog, #story, /shop?sort=newest" />
              </Field>
            )}

            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={editing.enabled} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} /> {isArabic ? "ظاهر" : "Visible"}</label>
              <label className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={editing.showInPrimary} onChange={(e) => setEditing({ ...editing, showInPrimary: e.target.checked })} /> {isArabic ? "إظهار في الشريط العلوي (سطح المكتب)" : "Show in desktop row"}</label>
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
