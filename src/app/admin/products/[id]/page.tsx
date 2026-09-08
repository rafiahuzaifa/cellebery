"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { useAdminProducts } from "@/lib/admin/product-store";
import { useLocale } from "@/components/locale-provider";

export default function EditAdminProductPage() {
  const { id } = useParams<{ id: string }>();
  const { isArabic } = useLocale();
  const { products } = useAdminProducts();
  const product = products.find((entry) => entry.id === id);

  if (!product) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
        <p className="text-sm text-white/50">{isArabic ? "لم يتم العثور على المنتج." : "Product not found."}</p>
        <Link href="/admin/products" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#22d3ee]"><ArrowLeft size={13} /> {isArabic ? "العودة إلى المنتجات" : "Back to products"}</Link>
      </div>
    );
  }

  return <ProductForm initial={product} />;
}
