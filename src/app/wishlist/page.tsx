"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ShoppingBag, Trash2 } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useLocale } from "@/components/locale-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { useCart } from "@/components/cart-provider";

export default function WishlistPage() {
  const { isArabic } = useLocale();
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const labels = isArabic ? {
    eyebrow: "المفضلة",
    title: "قائمة أمنياتك.",
    count: "منتج محفوظ",
    countPlural: "منتجات محفوظة",
    empty: "لم تحفظ أي منتجات بعد.",
    explore: "استكشف المجموعة",
    continue: "متابعة التسوق",
    move: "نقل إلى السلة",
    remove: "إزالة",
  } : {
    eyebrow: "Wishlist",
    title: "Your wishlist.",
    count: "saved product",
    countPlural: "saved products",
    empty: "You haven't saved any products yet.",
    explore: "Explore the collection",
    continue: "Continue shopping",
    move: "Move to cart",
    remove: "Remove",
  };

  const moveToCart = (item: (typeof items)[number]) => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
    removeItem(item.id);
  };

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>

      <section className="mx-auto max-w-[1440px] px-6 pb-12 pt-16 lg:px-12 lg:pb-16 lg:pt-24">
        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#22d3ee]">{labels.eyebrow}</p>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="display-font text-6xl font-semibold uppercase leading-[0.88] sm:text-8xl">{labels.title}</h1>
            <p className="mt-5 text-xs uppercase tracking-[0.16em] text-white/40">{items.length} {items.length === 1 ? labels.count : labels.countPlural}</p>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.17em] text-white/60 transition hover:text-[#22d3ee]"><ArrowLeft size={15} /> {labels.continue}</Link>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="mx-auto max-w-[1440px] px-6 pb-32 lg:px-12">
          <div className="border border-white/10 bg-[#101416] px-6 py-24 text-center">
            <p className="text-sm text-white/50">{labels.empty}</p>
            <Link href="/shop" className="mt-7 inline-flex items-center gap-5 bg-[#22d3ee] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#080a0c]">{labels.explore}<ArrowUpRight size={15} /></Link>
          </div>
        </section>
      ) : (
        <section className="border-y border-white/10 bg-[#0d1113] px-6 py-10 lg:px-12 lg:py-16">
          <div className="mx-auto grid max-w-[1440px] gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="group border border-white/10 bg-[#101416]">
                <div className="relative aspect-square overflow-hidden bg-[#151a1c]">
                  <div className="full-media absolute inset-0 opacity-80 transition duration-700 group-hover:opacity-100" style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }} />
                  <button aria-label={`${labels.remove} ${item.name}`} onClick={() => removeItem(item.id)} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/25 bg-[#080a0c]/60 text-white/75 backdrop-blur-sm transition hover:border-red-300 hover:text-red-300"><Trash2 size={14} strokeWidth={1.5} /></button>
                </div>
                <div className="flex items-center justify-between gap-4 p-5">
                  <div><h2 className="text-base font-semibold tracking-[-0.02em]">{item.name}</h2><p className="mt-1 text-sm text-white/55">SAR {item.price}</p></div>
                  <button aria-label={`${labels.move}: ${item.name}`} onClick={() => moveToCart(item)} className="grid size-10 shrink-0 place-items-center rounded-full border border-[#22d3ee]/60 text-[#22d3ee] transition hover:bg-[#22d3ee] hover:text-[#080a0c]"><ShoppingBag size={15} strokeWidth={1.5} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
