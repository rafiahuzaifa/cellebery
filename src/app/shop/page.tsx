"use client";

import { ArrowLeft, ArrowUpRight, Heart, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { LanguageToggle, useLocale } from "@/components/locale-provider";
import { useMemo, useState } from "react";

const products = [
  {
    id: "x7-pro",
    name: "X7 Pro",
    category: "Headphones",
    detail: "Adaptive ANC / 40H battery",
    price: 499,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=85",
    badge: "Best seller",
  },
  {
    id: "air-one",
    name: "Air One",
    category: "Earbuds",
    detail: "Hi-Fi / IPX5 water resistant",
    price: 299,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&q=85",
    badge: "New arrival",
  },
  {
    id: "pulse-mini",
    name: "Pulse Mini",
    category: "Speakers",
    detail: "360 sound / 12H battery",
    price: 249,
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=85",
    badge: "Popular",
  },
  {
    id: "x5-core",
    name: "X5 Core",
    category: "Headphones",
    detail: "Deep bass / 32H battery",
    price: 349,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    badge: "Everyday essential",
  },
  {
    id: "air-pro",
    name: "Air Pro",
    category: "Earbuds",
    detail: "Spatial audio / ANC",
    price: 399,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=85",
    badge: "Signature",
  },
  {
    id: "pulse-max",
    name: "Pulse Max",
    category: "Speakers",
    detail: "Powerful bass / IPX7",
    price: 599,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=85",
    badge: "Made for outdoors",
  },
];

type Product = (typeof products)[number];

function ProductCard({ product, saved, onToggle }: { product: Product; saved: boolean; onToggle: () => void }) {
  return (
    <article className="group">
      <div className="relative aspect-[0.92] overflow-hidden bg-[#151a1c]">
        <div className="absolute inset-0 bg-cover bg-center opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-100" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,10,12,.06), rgba(8,10,12,.5)), url(${product.image})` }} />
        <span className="absolute left-4 top-4 border border-white/20 bg-[#080a0c]/60 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white/70 backdrop-blur-sm">{product.badge}</span>
        <button aria-label={`${saved ? "Remove" : "Add"} ${product.name} ${saved ? "from" : "to"} wishlist`} onClick={onToggle} className={`absolute right-4 top-4 grid size-9 place-items-center rounded-full border backdrop-blur-sm transition ${saved ? "border-[#9ff6ed] bg-[#9ff6ed] text-[#080a0c]" : "border-white/25 bg-[#080a0c]/40 text-white/75 hover:border-[#9ff6ed] hover:text-[#9ff6ed]"}`}>
          <Heart size={15} fill={saved ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>
          <Link href={`/shop/${product.id}`} className="absolute bottom-4 left-4 right-4 flex translate-y-3 items-center justify-between bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#080a0c] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View product <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="flex items-start justify-between gap-4 pt-5">
        <div><h2 className="text-lg font-semibold tracking-[-0.03em]">{product.name}</h2><p className="mt-1 text-xs text-white/45">{product.detail}</p><p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#9ff6ed]">{product.category} · {product.rating} ★</p></div>
        <span className="pt-1 text-sm text-white/75">SAR {product.price}</span>
      </div>
    </article>
  );
}

export default function ShopPage() {
  const { isArabic } = useLocale();
  const [activeFilter, setActiveFilter] = useState("All products");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Featured");
  const [saved, setSaved] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const labels = isArabic ? {
    collection: "مجموعة CELIBERY",
    title: "اعثر على ترددك.",
    description: "من صباحات التركيز إلى الليالي الطويلة، اعثر على الصوت الذي يشبهك.",
    products: "منتجات",
    all: "كل المنتجات",
    headphones: "سماعات الرأس",
    earbuds: "سماعات الأذن",
    speakers: "مكبرات الصوت",
    search: "ابحث عن المنتجات",
    results: "نتيجة",
    delivery: "توصيل مجاني للطلبات فوق ٣٩٩ ر.س",
    clear: "مسح الفلاتر",
  } : {
    collection: "The CELIBERY collection",
    title: "Find your frequency.",
    description: "From focused mornings to nights that stretch longer, find the sound that belongs to you.",
    products: "products",
    all: "All products",
    headphones: "Headphones",
    earbuds: "Earbuds",
    speakers: "Speakers",
    search: "Search products",
    results: "results",
    delivery: "Free delivery over SAR 399",
    clear: "Clear filters",
  };
  const translatedFilters = [labels.all, labels.headphones, labels.earbuds, labels.speakers];
  const filterMap: Record<string, string> = { [labels.all]: "All products", [labels.headphones]: "Headphones", [labels.earbuds]: "Earbuds", [labels.speakers]: "Speakers" };

  const filteredProducts = useMemo(() => {
    const matching = products.filter((product) => {
      const matchesCategory = activeFilter === "All products" || product.category === activeFilter;
      const searchText = `${product.name} ${product.category} ${product.detail}`.toLowerCase();
      return matchesCategory && searchText.includes(query.toLowerCase());
    });

    return [...matching].sort((a, b) => {
      if (sort === "Price: low to high") return a.price - b.price;
      if (sort === "Price: high to low") return b.price - a.price;
      return 0;
    });
  }, [activeFilter, query, sort]);

  const toggleSaved = (id: string) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10 px-6 py-6 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-[0.28em]">CELIBERY</Link>
          <div className="hidden items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55 lg:flex"><Link className="text-white" href="/shop">{isArabic ? "المتجر" : "Shop"}</Link><Link href="/">{labels.headphones}</Link><Link href="/">{labels.earbuds}</Link><Link href="/">{labels.speakers}</Link></div>
          <div className="flex items-center gap-3"><Link href="/" aria-label="Back to home" className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-[#9ff6ed] hover:text-[#9ff6ed]"><ArrowLeft size={16} /></Link><LanguageToggle /><button aria-label="Shopping bag" className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-[#9ff6ed] hover:text-[#9ff6ed]"><span className="text-sm">0</span></button></div>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-6 pb-16 pt-20 lg:px-12 lg:pb-24 lg:pt-28"><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ff6ed]">{labels.collection}</p><div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><h1 className="display-font text-6xl font-semibold uppercase leading-[0.88] sm:text-8xl">{isArabic ? <>اعثر على<br /><span className="text-white/35">ترددك.</span></> : <>Find your<br /><span className="text-white/35">frequency.</span></>}</h1><p className="mt-7 max-w-md text-sm leading-7 text-white/50">{labels.description}</p></div><p className="max-w-xs text-[10px] uppercase leading-5 tracking-[0.15em] text-white/40">Premium audio / Saudi Arabia<br />{products.length} {labels.products}</p></div></section>

      <section className="border-y border-white/10 bg-[#0d1113] px-6 py-4 lg:px-12"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{translatedFilters.map((filter) => <button key={filter} onClick={() => setActiveFilter(filterMap[filter])} className={`whitespace-nowrap border px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] transition ${activeFilter === filterMap[filter] ? "border-[#9ff6ed] bg-[#9ff6ed] text-[#080a0c]" : "border-white/15 text-white/55 hover:border-white/40 hover:text-white"}`}>{filter}</button>)}</div><div className="flex gap-2"><label className="flex min-w-0 flex-1 items-center gap-2 border border-white/15 px-3 text-white/45 focus-within:border-[#9ff6ed] lg:w-64"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} className="min-w-0 bg-transparent py-3 text-xs text-white outline-none placeholder:text-white/35" /></label><button onClick={() => setFiltersOpen((open) => !open)} aria-label={isArabic ? "فتح الفلاتر" : "Toggle filters"} className={`grid size-11 place-items-center border transition lg:hidden ${filtersOpen ? "border-[#9ff6ed] text-[#9ff6ed]" : "border-white/15 text-white/60"}`}><SlidersHorizontal size={16} /></button><select value={sort} onChange={(event) => setSort(event.target.value)} className="hidden border border-white/15 bg-[#0d1113] px-3 text-[10px] uppercase tracking-[0.12em] text-white/60 outline-none lg:block"><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option></select></div>{filtersOpen && <div className="flex gap-2 lg:hidden"><select value={sort} onChange={(event) => setSort(event.target.value)} className="w-full border border-white/15 bg-[#0d1113] px-3 py-3 text-[10px] uppercase tracking-[0.12em] text-white/60 outline-none"><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option></select><button aria-label={isArabic ? "إغلاق الفلاتر" : "Close filters"} onClick={() => setFiltersOpen(false)} className="grid size-11 place-items-center border border-white/15 text-white/60"><X size={16} /></button></div>}</div></section>

      <section className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 lg:py-20"><div className="mb-8 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-white/40"><span>{filteredProducts.length} {labels.results}</span><span className="text-[#9ff6ed]">{labels.delivery}</span></div>{filteredProducts.length > 0 ? <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} saved={saved.includes(product.id)} onToggle={() => toggleSaved(product.id)} />)}</div> : <div className="border border-white/10 py-24 text-center"><p className="text-sm text-white/50">{isArabic ? "لا توجد منتجات تطابق بحثك." : "No products match your search."}</p><button onClick={() => { setQuery(""); setActiveFilter("All products"); }} className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9ff6ed]">{labels.clear}</button></div>}</section>

      <footer className="border-t border-white/10 px-6 py-10 lg:px-12"><div className="mx-auto flex max-w-[1440px] justify-between gap-6 text-[10px] uppercase tracking-[0.15em] text-white/40"><span>CELIBERY / Sound without limits.</span><Link href="/">Back to home ↑</Link></div></footer>
    </main>
  );
}
