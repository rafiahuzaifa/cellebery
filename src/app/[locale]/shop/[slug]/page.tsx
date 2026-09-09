import type { Metadata } from "next";
import { getPublicProductBySlug } from "@/actions/products";
import { getPublicProductReviews } from "@/actions/reviews";
import { ProductDetail } from "@/components/shop/product-detail";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) return { title: "Product not found | CELIBERY" };

  const t = locale === "ar" && product.ar.name ? product.ar : product.en;
  const title = t.seoTitle || `${t.name} | CELIBERY`;
  const description = t.seoDescription || t.shortDescription || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/${locale}/shop/${slug}` },
    openGraph: { title, description, images: product.image ? [{ url: product.image }] : undefined, type: "website" },
  };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/shop/[slug]">) {
  const { slug, locale } = await params;
  const [product, reviews] = await Promise.all([getPublicProductBySlug(slug), getPublicProductReviews(slug)]);

  if (!product) return <ProductDetail product={null} locale={locale} />;

  const t = locale === "ar" && product.ar.name ? product.ar : product.en;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellebry.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t.name,
    description: t.shortDescription || undefined,
    image: product.image ? `${base}${product.image}` : undefined,
    sku: product.sku,
    brand: { "@type": "Brand", name: "CELIBERY" },
    aggregateRating: product.reviewCount > 0 ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "SAR",
      price: product.salePrice ?? product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${base}/${locale}/shop/${slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} locale={locale} reviews={reviews} />
    </>
  );
}
