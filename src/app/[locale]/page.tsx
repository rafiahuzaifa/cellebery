import { getPublicProducts } from "@/actions/products";
import { getHomepageSections } from "@/actions/homepage";
import { HomeContent } from "@/components/home/home-content";

export default async function Home() {
  const [products, sections] = await Promise.all([getPublicProducts(), getHomepageSections()]);
  return <HomeContent products={products} sections={sections} />;
}
