import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import type { ChatProductCardData } from "@/lib/ai/types";

export function ChatProductCard({
  product,
  locale,
  isArabic,
  onAddToCart,
  onView,
}: {
  product: ChatProductCardData;
  locale: string;
  isArabic: boolean;
  onAddToCart: (product: ChatProductCardData) => void;
  onView?: (product: ChatProductCardData) => void;
}) {
  const price = product.salePrice ?? product.price;

  return (
    <div className="w-64 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#101416]">
      <Link href={`/${locale}/shop/${product.slug}`} className="block" onClick={() => onView?.(product)}>
        <div className="aspect-square bg-[#151a1c] bg-cover bg-center" style={{ backgroundImage: `url(${product.image})` }} />
      </Link>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white/90">{product.name}</p>
        {product.reason && <p className="mt-0.5 line-clamp-2 text-[11px] text-white/50">{product.reason}</p>}
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/40">
          <Star size={11} className="fill-[#22d3ee] text-[#22d3ee]" /> {product.rating.toFixed(1)}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-white">SAR {price}</span>
          {product.salePrice && <span className="text-[11px] text-white/35 line-through">SAR {product.price}</span>}
        </div>
        {!product.inStock && <p className="mt-1 text-[10px] text-red-300">{isArabic ? "غير متوفر حالياً" : "Out of stock"}</p>}
        <div className="mt-3 flex gap-2">
          <Link href={`/${locale}/shop/${product.slug}`} onClick={() => onView?.(product)} className="flex-1 rounded-lg border border-white/15 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-white/75 transition hover:border-white/40">
            {isArabic ? "عرض المنتج" : "View"}
          </Link>
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => onAddToCart(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#22d3ee] py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#080a0c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag size={12} /> {isArabic ? "أضف" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
