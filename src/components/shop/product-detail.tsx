"use client";

import { ArrowUpRight, Check, ShieldCheck, Star, Truck } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { SiteNav } from "@/components/site-nav";
import { useCart } from "@/components/cart-provider";
import { categoryOptions, type AdminProduct } from "@/lib/admin/catalog";
import { ProductReviews } from "@/components/shop/product-reviews";
import type { PublicReview } from "@/actions/reviews";
import { useState } from "react";

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} className={star <= Math.round(rating) ? "fill-[#22d3ee] text-[#22d3ee]" : "text-white/20"} />)}
    </span>
  );
}

export function ProductDetail({ product, locale, reviews = [] }: { product: AdminProduct | null; locale: string; reviews?: PublicReview[] }) {
  const { isArabic } = useLocale();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const labels = isArabic ? {
    designed: "مصمم في المملكة العربية السعودية",
    freeDelivery: "توصيل مجاني",
    add: "أضف إلى السلة",
    outOfStock: "غير متوفر حالياً",
    delivery: "توصيل سريع داخل السعودية",
    returns: "إرجاع سهل",
    engineered: "مصمم لأداء أعلى",
    back: "العودة إلى المجموعة",
    added: "تمت الإضافة إلى السلة",
    notFound: "لم يتم العثور على المنتج.",
    browseShop: "تصفح المتجر",
  } : {
    designed: "Designed in Saudi Arabia",
    freeDelivery: "Free delivery",
    add: "Add to cart",
    outOfStock: "Out of stock",
    delivery: "Fast Saudi delivery",
    returns: "Easy returns",
    engineered: "Engineered for more",
    back: "Back to collection",
    added: "Added to cart",
    notFound: "Product not found.",
    browseShop: "Browse the shop",
  };

  if (!product) {
    return (
      <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
        <header className="border-b border-white/10"><SiteNav /></header>
        <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-white/50">{labels.notFound}</p>
          <Link href={`/${locale}/shop`} className="mt-7 inline-flex items-center gap-5 bg-[#22d3ee] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#080a0c]">{labels.browseShop}<ArrowUpRight size={15} /></Link>
        </section>
      </main>
    );
  }

  const t = isArabic && product.ar.name ? product.ar : product.en;
  const features = t.features.length > 0 ? t.features : product.en.features;
  const category = categoryOptions.find((c) => c.value === product.category);
  const price = product.salePrice ?? product.price;
  const inStock = product.stock > 0;

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>
      <section className="mx-auto grid max-w-[1440px] gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-24 lg:px-12 lg:py-20">
        <div className="relative aspect-square overflow-hidden border border-white/10 bg-[#151a1c] shadow-2xl shadow-cyan-950/20">
          <div className="product-media absolute inset-0 transition duration-700 hover:scale-105" style={{ backgroundImage: `url(${product.image})` }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#080a0c]/70 to-transparent" />
          <span className="absolute bottom-6 left-6 border border-[#22d3ee]/40 bg-[#080a0c]/70 px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-[#22d3ee] backdrop-blur-sm">{labels.designed}</span>
          {product.salePrice && <span className="absolute right-6 top-6 rounded-full bg-[#22d3ee] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#080a0c]">{Math.round(100 - (product.salePrice / product.price) * 100)}% {isArabic ? "خصم" : "OFF"}</span>}
        </div>
        <div>
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? category?.ar : category?.en}</p>
          <h1 className="display-font text-7xl font-semibold uppercase leading-[0.85] sm:text-8xl">{t.name}</h1>
          <div className="mt-5 flex items-center gap-3"><RatingStars rating={product.rating} /><span className="text-xs text-white/45">{product.rating} ({product.reviewCount} {isArabic ? "تقييم" : "reviews"})</span></div>
          <p className="mt-8 max-w-md text-base leading-8 text-white/55">{t.description}</p>
          <div className="mt-8 flex items-center gap-5">
            <span className="text-2xl">SAR {price}</span>
            {product.salePrice && <span className="text-sm text-white/35 line-through">SAR {product.price}</span>}
            <span className="text-xs text-white/40">{labels.freeDelivery}</span>
          </div>
          <button
            disabled={!inStock}
            onClick={() => { addItem({ id: product.id, name: t.name, price, image: product.image }); setAdded(true); }}
            className="mt-9 flex w-full items-center justify-between bg-[#22d3ee] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.17em] text-[#080a0c] transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 sm:w-80"
          >
            {!inStock ? labels.outOfStock : added ? labels.added : labels.add} {inStock && <ArrowUpRight size={16} />}
          </button>
          <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
            <div className="flex gap-3 text-[10px] uppercase leading-4 tracking-[0.1em] text-white/55"><Truck size={16} className="shrink-0 text-[#22d3ee]" /> {labels.delivery}</div>
            <div className="flex gap-3 text-[10px] uppercase leading-4 tracking-[0.1em] text-white/55"><ShieldCheck size={16} className="shrink-0 text-[#22d3ee]" /> {product.warrantyMonths}-{isArabic ? "شهر ضمان" : "month warranty"}</div>
            <div className="flex gap-3 text-[10px] uppercase leading-4 tracking-[0.1em] text-white/55"><Check size={16} className="shrink-0 text-[#22d3ee]" /> {labels.returns}</div>
          </div>
        </div>
      </section>
      {features.length > 0 && (
        <section className="border-y border-white/10 bg-[#0d1113] px-6 py-16 lg:px-12">
          <div className="mx-auto max-w-[1440px]">
            <p className="mb-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{labels.engineered}</p>
            <div className="grid gap-0 border-l border-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => <div key={feature} className="border-b border-r border-white/10 px-5 py-6 text-sm text-white/70 lg:border-b-0"><div className="mb-8 size-2 bg-[#22d3ee]" />{feature}</div>)}
            </div>
          </div>
        </section>
      )}
      <ProductReviews reviews={reviews} slug={product.id} locale={locale} isArabic={isArabic} />
      <footer className="px-6 py-10 lg:px-12"><div className="mx-auto flex max-w-[1440px] justify-between text-[10px] uppercase tracking-[0.15em] text-white/40"><span>CELIBERY / Sound without limits.</span><Link href={`/${locale}/shop`}>{labels.back} ↑</Link></div></footer>
    </main>
  );
}
