import { getPublicProductBySlug } from "@/actions/products";
import { ProductDetail } from "@/components/shop/product-detail";

export default async function ProductPage({ params }: PageProps<"/[locale]/shop/[slug]">) {
  const { slug, locale } = await params;
  const product = await getPublicProductBySlug(slug);
  return <ProductDetail product={product} locale={locale} />;
}
