"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { categoryOptions, translationStatus, type AdminProduct } from "@/lib/admin/catalog";
import { useAdminProducts } from "@/lib/admin/product-store";

const emptyTranslation = { name: "", shortDescription: "", description: "", seoTitle: "", seoDescription: "" };

function blankProduct(): AdminProduct {
  return {
    id: "",
    sku: "",
    category: "headphones",
    price: 0,
    salePrice: null,
    stock: 0,
    lowStockThreshold: 10,
    warrantyMonths: 12,
    status: "draft",
    image: "/products/headphones-classic.jpg",
    updatedAt: new Date().toISOString().slice(0, 10),
    en: { ...emptyTranslation },
    ar: { ...emptyTranslation },
  };
}

export function ProductForm({ initial }: { initial?: AdminProduct }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const { upsert } = useAdminProducts();
  const [product, setProduct] = useState<AdminProduct>(initial ?? blankProduct());
  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");
  const isNew = !initial;

  const status = translationStatus(product);

  const save = () => {
    const slugSource = product.en.name || product.sku || "product";
    const id = product.id || slugSource.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `product-${Date.now()}`;
    upsert({ ...product, id, updatedAt: new Date().toISOString().slice(0, 10) });
    router.push("/admin/products");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/products" className="mb-3 inline-flex items-center gap-2 text-[11px] text-white/50 transition hover:text-white"><ArrowLeft size={13} /> {isArabic ? "المنتجات" : "Products"}</Link>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">{isNew ? (isArabic ? "منتج جديد" : "New product") : (isArabic ? "تعديل المنتج" : "Edit product")}</h1>
        </div>
        <button onClick={save} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white">
          <Save size={14} /> {isArabic ? "حفظ" : "Save"}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                <button onClick={() => setActiveTab("en")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${activeTab === "en" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>ENGLISH</button>
                <button onClick={() => setActiveTab("ar")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${activeTab === "ar" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>العربية</button>
              </div>
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                {isArabic ? "حالة الترجمة:" : "Translation status:"} <span className={status === "complete" ? "text-emerald-300" : status === "partial" ? "text-amber-300" : "text-white/40"}>{status}</span>
              </span>
            </div>

            {activeTab === "en" ? (
              <div className="space-y-4" key="en">
                <Field label="Product Name">
                  <input value={product.en.name} onChange={(e) => setProduct({ ...product, en: { ...product.en, name: e.target.value } })} className="admin-input" placeholder="CELIBERY X7 Pro" />
                </Field>
                <Field label="Short Description">
                  <input value={product.en.shortDescription} onChange={(e) => setProduct({ ...product, en: { ...product.en, shortDescription: e.target.value } })} className="admin-input" placeholder="Immersive sound. All-day freedom." />
                </Field>
                <Field label="Full Description">
                  <textarea value={product.en.description} onChange={(e) => setProduct({ ...product, en: { ...product.en, description: e.target.value } })} rows={4} className="admin-input resize-none" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="SEO Title"><input value={product.en.seoTitle} onChange={(e) => setProduct({ ...product, en: { ...product.en, seoTitle: e.target.value } })} className="admin-input" /></Field>
                  <Field label="SEO Description"><input value={product.en.seoDescription} onChange={(e) => setProduct({ ...product, en: { ...product.en, seoDescription: e.target.value } })} className="admin-input" /></Field>
                </div>
              </div>
            ) : (
              <div className="space-y-4" dir="rtl" key="ar">
                <Field label="اسم المنتج">
                  <input value={product.ar.name} onChange={(e) => setProduct({ ...product, ar: { ...product.ar, name: e.target.value } })} className="admin-input text-right" placeholder="سيليبري X7 برو" />
                </Field>
                <Field label="وصف مختصر">
                  <input value={product.ar.shortDescription} onChange={(e) => setProduct({ ...product, ar: { ...product.ar, shortDescription: e.target.value } })} className="admin-input text-right" placeholder="صوت غامر. حرية طوال اليوم." />
                </Field>
                <Field label="الوصف الكامل">
                  <textarea value={product.ar.description} onChange={(e) => setProduct({ ...product, ar: { ...product.ar, description: e.target.value } })} rows={4} className="admin-input resize-none text-right" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="عنوان SEO"><input value={product.ar.seoTitle} onChange={(e) => setProduct({ ...product, ar: { ...product.ar, seoTitle: e.target.value } })} className="admin-input text-right" /></Field>
                  <Field label="وصف SEO"><input value={product.ar.seoDescription} onChange={(e) => setProduct({ ...product, ar: { ...product.ar, seoDescription: e.target.value } })} className="admin-input text-right" /></Field>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "الصور" : "Images"}</h2>
            <div className="flex items-center gap-4">
              <div className="size-20 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-white/10" style={{ backgroundImage: `url(${product.image})` }} />
              <Field label={isArabic ? "رابط الصورة الرئيسية" : "Primary image path"} className="flex-1">
                <input value={product.image} onChange={(e) => setProduct({ ...product, image: e.target.value })} className="admin-input" placeholder="/products/headphones-detail.jpg" />
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "التسعير والمخزون" : "Pricing & inventory"}</h2>
            <div className="space-y-4">
              <Field label={isArabic ? "SKU" : "SKU"}><input value={product.sku} onChange={(e) => setProduct({ ...product, sku: e.target.value })} className="admin-input" placeholder="CEL-HP-X7PRO" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={isArabic ? "السعر" : "Price"}><input type="number" value={product.price} onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })} className="admin-input" /></Field>
                <Field label={isArabic ? "سعر الخصم" : "Sale price"}><input type="number" value={product.salePrice ?? ""} onChange={(e) => setProduct({ ...product, salePrice: e.target.value ? Number(e.target.value) : null })} className="admin-input" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={isArabic ? "المخزون" : "Stock"}><input type="number" value={product.stock} onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })} className="admin-input" /></Field>
                <Field label={isArabic ? "حد المخزون المنخفض" : "Low stock threshold"}><input type="number" value={product.lowStockThreshold} onChange={(e) => setProduct({ ...product, lowStockThreshold: Number(e.target.value) })} className="admin-input" /></Field>
              </div>
              <Field label={isArabic ? "الضمان (أشهر)" : "Warranty (months)"}><input type="number" value={product.warrantyMonths} onChange={(e) => setProduct({ ...product, warrantyMonths: Number(e.target.value) })} className="admin-input" /></Field>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "التنظيم" : "Organization"}</h2>
            <div className="space-y-4">
              <Field label={isArabic ? "الفئة" : "Category"}>
                <select value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value as AdminProduct["category"] })} className="admin-input">
                  {categoryOptions.map((option) => <option key={option.value} value={option.value}>{isArabic ? option.ar : option.en}</option>)}
                </select>
              </Field>
              <Field label={isArabic ? "الحالة" : "Status"}>
                <select value={product.status} onChange={(e) => setProduct({ ...product, status: e.target.value as AdminProduct["status"] })} className="admin-input">
                  <option value="draft">{isArabic ? "مسودة" : "Draft"}</option>
                  <option value="active">{isArabic ? "منشور" : "Active"}</option>
                  <option value="archived">{isArabic ? "مؤرشف" : "Archived"}</option>
                </select>
              </Field>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{label}</span>
      {children}
    </label>
  );
}
