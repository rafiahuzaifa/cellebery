import { Suspense } from "react";
import { getPublicProducts } from "@/actions/products";
import { ShopPageContent } from "@/components/shop/shop-page-content";

export default async function ShopPage() {
  const products = await getPublicProducts();
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#080a0c]" />}>
      <ShopPageContent products={products} />
    </Suspense>
  );
}
