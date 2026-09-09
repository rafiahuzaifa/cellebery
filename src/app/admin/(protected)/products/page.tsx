"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { useAdminProducts } from "@/lib/admin/product-store";
import { categoryOptions } from "@/lib/admin/catalog";
import { TranslationBadge } from "@/components/admin/translation-badge";

const statusTone: Record<string, string> = {
  active: "text-emerald-300 bg-emerald-500/10",
  draft: "text-amber-300 bg-amber-500/10",
  archived: "text-white/40 bg-white/5",
};

export default function AdminProductsPage() {
  const { isArabic } = useLocale();
  const { products, remove, duplicate, setStatus } = useAdminProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const haystack = `${product.en.name} ${product.ar.name} ${product.sku}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "الكتالوج" : "Catalog"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "المنتجات" : "Products"}</h1>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white">
          <Plus size={14} /> {isArabic ? "منتج جديد" : "New product"}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/12 bg-[#101416] px-3 py-2.5 text-white/40 focus-within:border-[#22d3ee] sm:max-w-xs">
          <Search size={14} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "بحث بالاسم أو SKU" : "Search name or SKU"} className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30" />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-white/12 bg-[#101416] px-3 py-2.5 text-xs text-white/70 outline-none focus:border-[#22d3ee]">
          <option value="all">{isArabic ? "كل الفئات" : "All categories"}</option>
          {categoryOptions.map((option) => <option key={option.value} value={option.value}>{isArabic ? option.ar : option.en}</option>)}
        </select>
        <span className="text-[11px] text-white/35">{filtered.length} {isArabic ? "منتج" : "products"}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101416]">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/40">
              <th className="px-4 py-3 font-medium">{isArabic ? "المنتج" : "Product"}</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "السعر" : "Price"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "المخزون" : "Stock"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "الترجمة" : "Translation"}</th>
              <th className="px-4 py-3 font-medium text-end">{isArabic ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${product.image})` }} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white/85">{isArabic ? product.ar.name || product.en.name : product.en.name}</p>
                      <p className="text-[10px] text-white/40">{isArabic ? categoryOptions.find((c) => c.value === product.category)?.ar : categoryOptions.find((c) => c.value === product.category)?.en}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/55">{product.sku}</td>
                <td className="px-4 py-3 text-white/70">
                  SAR {product.salePrice ?? product.price}
                  {product.salePrice && <span className="ms-1.5 text-white/30 line-through">{product.price}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={product.stock <= product.lowStockThreshold ? "text-red-300" : "text-white/70"}>{product.stock}</span>
                </td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${statusTone[product.status]}`}>{product.status}</span></td>
                <td className="px-4 py-3"><TranslationBadge product={product} isArabic={isArabic} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      aria-label={product.status === "active" ? "Unpublish" : "Publish"}
                      onClick={() => setStatus(product.id, product.status === "active" ? "draft" : "active")}
                      className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"
                    >
                      {product.status === "active" ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <Link href={`/admin/products/${product.id}`} aria-label="Edit" className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"><Pencil size={14} /></Link>
                    <button aria-label="Duplicate" onClick={() => duplicate(product.id)} className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"><Copy size={14} /></button>
                    <button aria-label="Delete" onClick={() => { if (confirm(isArabic ? "حذف هذا المنتج؟" : "Delete this product?")) remove(product.id); }} className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/40">{isArabic ? "لا توجد منتجات مطابقة." : "No matching products."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
