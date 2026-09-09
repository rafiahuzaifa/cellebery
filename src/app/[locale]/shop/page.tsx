import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublicProducts } from "@/actions/products";
import { ShopPageContent } from "@/components/shop/shop-page-content";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic ? "المتجر | CELIBERY" : "Shop | CELIBERY",
    description: isArabic
      ? "تسوق سماعات الرأس والأذن ومكبرات الصوت الفاخرة من CELIBERY. توصيل سريع داخل السعودية."
      : "Shop premium CELIBERY headphones, earbuds, and speakers. Fast delivery across Saudi Arabia.",
    alternates: { canonical: `/${locale}/shop` },
  };
}

export default async function ShopPage() {
  const products = await getPublicProducts();
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#080a0c]" />}>
      <ShopPageContent products={products} />
    </Suspense>
  );
}
