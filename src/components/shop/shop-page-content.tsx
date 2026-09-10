"use client";

import { ArrowUpRight, Heart, Search, SlidersHorizontal, Star, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { SiteNav } from "@/components/site-nav";
import { useWishlist } from "@/components/wishlist-provider";
import { categoryOptions, type AdminProduct } from "@/lib/admin/catalog";
import { useMemo, useState } from "react";

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={10} className={star <= Math.round(rating) ? "fill-[#22d3ee] text-[#22d3ee]" : "text-white/20"} />)}
    </span>
  );
}

function ProductCard({ product, saved, onToggle, locale, isArabic }: { product: AdminProduct; saved: boolean; onToggle: () => void; locale: string; isArabic: boolean }) {
  const t = isArabic && product.ar.name ? product.ar : product.en;
  const price = product.salePrice ?? product.price;
  const categoryLabel = categoryOptions.find((c) => c.value === product.category);

  return (
    <article className="group">
      <div className="relative aspect-[0.92] overflow-hidden bg-[#151a1c]">
        <div className="product-media absolute inset-0 opacity-90 transition duration-700 group-hover:opacity-100 group-hover:scale-105" style={{ backgroundImage: `url(${product.image})` }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#080a0c]/55 to-transparent" />
        {product.salePrice && <span className="absolute left-4 top-4 rounded-full bg-[#22d3ee] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#080a0c]">{Math.round(100 - (product.salePrice / product.price) * 100)}% {isArabic ? "خصم" : "OFF"}</span>}
        <button aria-label={`${saved ? "Remove" : "Add"} ${t.name} ${saved ? "from" : "to"} wishlist`} onClick={onToggle} className={`absolute right-4 top-4 grid size-9 place-items-center rounded-full border backdrop-blur-sm transition ${saved ? "border-[#22d3ee] bg-[#22d3ee] text-[#080a0c]" : "border-white/25 bg-[#080a0c]/40 text-white/75 hover:border-[#22d3ee] hover:text-[#22d3ee]"}`}>
          <Heart size={15} fill={saved ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>
        <Link href={`/${locale}/shop/${product.id}`} className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#080a0c] transition duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          {isArabic ? "عرض المنتج" : "View product"} <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="flex items-start justify-between gap-4 pt-5">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.03em]">{t.name}</h2>
          <p className="mt-1 text-xs text-white/45">{t.shortDescription}</p>
          <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#22d3ee]">
            <span>{isArabic ? categoryLabel?.ar : categoryLabel?.en}</span>
            <span className="text-white/20">·</span>
            <RatingStars rating={product.rating} />
          </div>
        </div>
        <div className="pt-1 text-right">
          <span className="block text-sm text-white/75">SAR {price}</span>
          {product.salePrice && <span className="block text-[10px] text-white/35 line-through">SAR {product.price}</span>}
        </div>
      </div>
    </article>
  );
}

export function ShopPageContent({ products }: { products: AdminProduct[] }) {
  const { isArabic, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSaved, toggleItem } = useWishlist();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const labels = isArabic ? {
    collection: "مجموعة CELIBERY",
    title: "اعثر على ترددك.",
    description: "من صباحات التركيز إلى الليالي الطويلة، اعثر على الصوت الذي يشبهك.",
    products: "منتجات",
    all: "كل المنتجات",
    search: "ابحث عن المنتجات",
    results: "نتيجة",
    delivery: "توصيل مجاني للطلبات فوق ٣٩٩ ر.س",
    clear: "مسح الفلاتر",
    featured: "مميز",
    priceLow: "السعر: من الأقل",
    priceHigh: "السعر: من الأعلى",
    ratingSort: "الأعلى تقييماً",
  } : {
    collection: "The CELIBERY collection",
    title: "Find your frequency.",
    description: "From focused mornings to nights that stretch longer, find the sound that belongs to you.",
    products: "products",
    all: "All products",
    search: "Search products",
    results: "results",
    delivery: "Free delivery over SAR 399",
    clear: "Clear filters",
    featured: "Featured",
    priceLow: "Price: low to high",
    priceHigh: "Price: high to low",
    ratingSort: "Best rated",
  };

  const categoryParam = searchParams.get("category");
  const activeFilter = categoryParam && categoryOptions.some((c) => c.value === categoryParam) ? categoryParam : selectedFilter;
  const frequencyImage = categoryOptions.find((c) => c.value === activeFilter)
    ? products.find((p) => p.category === activeFilter)?.image
    : products[0]?.image;

  const chooseFilter = (filter: string) => {
    setSelectedFilter(filter);
    router.replace(filter === "all" ? `/${locale}/shop` : `/${locale}/shop?category=${filter}`);
  };

  const filteredProducts = useMemo(() => {
    const matching = products.filter((product) => {
      const matchesCategory = activeFilter === "all" || product.category === activeFilter;
      const t = isArabic && product.ar.name ? product.ar : product.en;
      const searchText = `${t.name} ${t.shortDescription} ${product.sku}`.toLowerCase();
      return matchesCategory && searchText.includes(query.toLowerCase());
    });

    return [...matching].sort((a, b) => {
      const priceA = a.salePrice ?? a.price;
      const priceB = b.salePrice ?? b.price;
      if (sort === "price-low") return priceA - priceB;
      if (sort === "price-high") return priceB - priceA;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [products, activeFilter, query, sort, isArabic]);

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>

      <section className="mx-auto max-w-[1440px] px-6 pb-16 pt-20 lg:px-12 lg:pb-24 lg:pt-28"><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{labels.collection}</p><div className="grid gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-end lg:gap-20"><div><h1 className="display-font text-6xl font-semibold uppercase leading-[0.88] sm:text-8xl">{isArabic ? <>اعثر على<br /><span className="text-white/35">ترددك.</span></> : <>Find your<br /><span className="text-white/35">frequency.</span></>}</h1><p className="mt-7 max-w-md text-sm leading-7 text-white/50">{labels.description}</p></div><div className="group relative min-h-52 overflow-hidden border border-white/10 bg-[#151a1c] sm:min-h-64"><div className="product-media absolute inset-0 bg-[#151a1c] transition duration-700 group-hover:scale-105" style={{ backgroundImage: frequencyImage ? `url(${frequencyImage})` : undefined }} /><div className="absolute inset-0 bg-gradient-to-tr from-[#080a0c]/80 via-[#080a0c]/25 to-transparent" /><div className="relative flex h-full min-h-52 flex-col justify-between p-5 sm:min-h-64 sm:p-7"><span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{activeFilter === "all" ? "CELIBERY / 01" : (isArabic ? categoryOptions.find((c) => c.value === activeFilter)?.ar : categoryOptions.find((c) => c.value === activeFilter)?.en)}</span><p className="max-w-[13rem] text-sm uppercase leading-5 tracking-[0.14em] text-white/75">Premium sound, tuned for your frequency.</p></div></div></div><p className="mt-8 max-w-xs text-[10px] uppercase leading-5 tracking-[0.15em] text-white/40">Premium audio / Saudi Arabia<br />{products.length} {labels.products}</p></section>

      <section className="border-y border-white/10 bg-[#0d1113] px-6 py-4 lg:px-12"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1"><button onClick={() => chooseFilter("all")} className={`whitespace-nowrap border px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] transition ${activeFilter === "all" ? "border-[#22d3ee] bg-[#22d3ee] text-[#080a0c]" : "border-white/15 text-white/55 hover:border-white/40 hover:text-white"}`}>{labels.all}</button>{categoryOptions.map((option) => <button key={option.value} onClick={() => chooseFilter(option.value)} className={`whitespace-nowrap border px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] transition ${activeFilter === option.value ? "border-[#22d3ee] bg-[#22d3ee] text-[#080a0c]" : "border-white/15 text-white/55 hover:border-white/40 hover:text-white"}`}>{isArabic ? option.ar : option.en}</button>)}</div><div className="flex gap-2"><label id="search" className="flex min-w-0 flex-1 items-center gap-2 border border-white/15 px-3 text-white/45 focus-within:border-[#22d3ee] lg:w-64"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} className="min-w-0 bg-transparent py-3 text-xs text-white outline-none placeholder:text-white/35" /></label><button onClick={() => setFiltersOpen((open) => !open)} aria-label={isArabic ? "فتح الفلاتر" : "Toggle filters"} className={`grid size-11 place-items-center border transition lg:hidden ${filtersOpen ? "border-[#22d3ee] text-[#22d3ee]" : "border-white/15 text-white/60"}`}><SlidersHorizontal size={16} /></button><select value={sort} onChange={(event) => setSort(event.target.value)} className="hidden border border-white/15 bg-[#0d1113] px-3 text-[10px] uppercase tracking-[0.12em] text-white/60 outline-none lg:block"><option value="featured">{labels.featured}</option><option value="price-low">{labels.priceLow}</option><option value="price-high">{labels.priceHigh}</option><option value="rating">{labels.ratingSort}</option></select></div>{filtersOpen && <div className="flex gap-2 lg:hidden"><select value={sort} onChange={(event) => setSort(event.target.value)} className="w-full border border-white/15 bg-[#0d1113] px-3 py-3 text-[10px] uppercase tracking-[0.12em] text-white/60 outline-none"><option value="featured">{labels.featured}</option><option value="price-low">{labels.priceLow}</option><option value="price-high">{labels.priceHigh}</option><option value="rating">{labels.ratingSort}</option></select><button aria-label={isArabic ? "إغلاق الفلاتر" : "Close filters"} onClick={() => setFiltersOpen(false)} className="grid size-11 place-items-center border border-white/15 text-white/60"><X size={16} /></button></div>}</div></section>

      <section className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 lg:py-20"><div className="mb-8 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-white/40"><span>{filteredProducts.length} {labels.results}</span><span className="text-[#22d3ee]">{labels.delivery}</span></div>{filteredProducts.length > 0 ? <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} saved={isSaved(product.id)} onToggle={() => toggleItem({ id: product.id, name: (isArabic && product.ar.name ? product.ar.name : product.en.name), price: product.salePrice ?? product.price, image: product.image })} locale={locale} isArabic={isArabic} />)}</div> : <div className="border border-white/10 py-24 text-center"><p className="text-sm text-white/50">{isArabic ? "لا توجد منتجات تطابق بحثك." : "No products match your search."}</p><button onClick={() => { setQuery(""); chooseFilter("all"); }} className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#22d3ee]">{labels.clear}</button></div>}</section>

      <footer className="border-t border-white/10 px-6 py-10 lg:px-12"><div className="mx-auto flex max-w-[1440px] justify-between gap-6 text-[10px] uppercase tracking-[0.15em] text-white/40"><span>CELIBERY / Sound without limits.</span><Link href={`/${locale}`}>Back to home ↑</Link></div></footer>
    </main>
  );
}
