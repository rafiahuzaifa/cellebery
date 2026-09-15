"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import {
  upsertAdminCategoryAction,
  deleteAdminCategoryAction,
  reorderAdminCategoryAction,
  type AdminCategoryRow,
} from "@/actions/categories";

function blankCategory(nextSortOrder: number): AdminCategoryRow {
  return {
    id: "",
    slug: "",
    imageUrl: "",
    sortOrder: nextSortOrder,
    productCount: 0,
    en: { name: "", description: "", seoTitle: "", seoDescription: "" },
    ar: { name: "", description: "", seoTitle: "", seoDescription: "" },
  };
}

export function CategoriesManager({ categories }: { categories: AdminCategoryRow[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const result = await upsertAdminCategoryAction(editing);
      if (result.error) { setError(result.error); return; }
      setEditing(null);
      router.refresh();
    });
  };

  const runAction = (action: () => Promise<unknown>) => startTransition(async () => { await action(); router.refresh(); });

  const removeCategory = (category: AdminCategoryRow) => {
    startTransition(async () => {
      const result = await deleteAdminCategoryAction(category.id);
      if (result.error) { setError(result.error); return; }
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "الكتالوج" : "Catalog"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "الفئات" : "Categories"}</h1>
          <p className="mt-1 text-xs text-white/40">{isArabic ? "تظهر هذه الفئات في المتجر والصفحة الرئيسية ونموذج المنتج." : "These categories power the shop filters, the homepage grid, and the product form."}</p>
        </div>
        <button onClick={() => { setEditing(blankCategory(categories.length)); setError(null); }} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white">
          <Plus size={14} /> {isArabic ? "فئة جديدة" : "New category"}
        </button>
      </div>

      {error && !editing && (
        <p className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"><AlertCircle size={14} className="shrink-0" /> {error}</p>
      )}

      {categories.length === 0 && !editing && (
        <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لا توجد فئات بعد." : "No categories yet — the shop and navbar will have nothing to filter by until one is added."}</p>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((category, i) => (
          <div key={category.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#101416] p-4">
            <div className="h-14 w-14 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-white/10" style={{ backgroundImage: category.imageUrl ? `url(${category.imageUrl})` : undefined }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white/90">{category.en.name || category.slug} <span className="font-normal text-white/35">/ {category.ar.name}</span></p>
              <p className="mt-0.5 truncate text-[11px] text-white/40">/{category.slug} · {category.productCount} {isArabic ? "منتج" : "products"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button disabled={isPending || i === 0} onClick={() => runAction(() => reorderAdminCategoryAction(category.id, "up"))} className="grid size-8 place-items-center rounded-md border border-white/15 text-white/50 transition hover:border-white/40 disabled:opacity-30"><ArrowUp size={13} /></button>
              <button disabled={isPending || i === categories.length - 1} onClick={() => runAction(() => reorderAdminCategoryAction(category.id, "down"))} className="grid size-8 place-items-center rounded-md border border-white/15 text-white/50 transition hover:border-white/40 disabled:opacity-30"><ArrowDown size={13} /></button>
              <button onClick={() => { setEditing(category); setError(null); }} className="border border-white/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/70 transition hover:border-white/40">{isArabic ? "تعديل" : "Edit"}</button>
              <button disabled={isPending} onClick={() => { if (confirm(isArabic ? "حذف هذه الفئة؟" : "Delete this category?")) removeCategory(category); }} className="grid size-8 shrink-0 place-items-center border border-white/15 text-white/50 transition hover:border-red-400/40 hover:text-red-300"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="max-w-3xl rounded-xl border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{editing.id ? (isArabic ? "تعديل الفئة" : "Edit category") : (isArabic ? "فئة جديدة" : "New category")}</h2>
          {error && <p className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300"><AlertCircle size={13} /> {error}</p>}

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug"><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="admin-input font-mono text-xs" placeholder="headphones" /></Field>
              <Field label={isArabic ? "رابط الصورة" : "Image URL"}><input value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} className="admin-input font-mono text-xs" placeholder="/products/headphones-classic.jpg" /></Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name (EN)"><input value={editing.en.name} onChange={(e) => setEditing({ ...editing, en: { ...editing.en, name: e.target.value } })} className="admin-input" placeholder="Headphones" /></Field>
              <Field label="الاسم (AR)"><input dir="rtl" value={editing.ar.name} onChange={(e) => setEditing({ ...editing, ar: { ...editing.ar, name: e.target.value } })} className="admin-input text-right" placeholder="سماعات الرأس" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Description (EN) — shown on the homepage card"><textarea value={editing.en.description} onChange={(e) => setEditing({ ...editing, en: { ...editing.en, description: e.target.value } })} rows={2} className="admin-input resize-none" placeholder="Immersive. Powerful. Personal." /></Field>
              <Field label="الوصف (AR)"><textarea dir="rtl" value={editing.ar.description} onChange={(e) => setEditing({ ...editing, ar: { ...editing.ar, description: e.target.value } })} rows={2} className="admin-input resize-none text-right" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SEO title (EN, optional)"><input value={editing.en.seoTitle} onChange={(e) => setEditing({ ...editing, en: { ...editing.en, seoTitle: e.target.value } })} className="admin-input" /></Field>
              <Field label="عنوان SEO (AR)"><input dir="rtl" value={editing.ar.seoTitle} onChange={(e) => setEditing({ ...editing, ar: { ...editing.ar, seoTitle: e.target.value } })} className="admin-input text-right" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SEO description (EN, optional)"><input value={editing.en.seoDescription} onChange={(e) => setEditing({ ...editing, en: { ...editing.en, seoDescription: e.target.value } })} className="admin-input" /></Field>
              <Field label="وصف SEO (AR)"><input dir="rtl" value={editing.ar.seoDescription} onChange={(e) => setEditing({ ...editing, ar: { ...editing.ar, seoDescription: e.target.value } })} className="admin-input text-right" /></Field>
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
