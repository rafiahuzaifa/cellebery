import type { MetadataRoute } from "next";
import { getPublicProducts } from "@/actions/products";

const LOCALES = ["en", "ar"] as const;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellebry.vercel.app";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getPublicProducts();

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => [
    { url: `${base}/${locale}`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/${locale}/shop`, changeFrequency: "daily", priority: 0.9 },
  ]);

  const productEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    products.map((product) => ({
      url: `${base}/${locale}/shop/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  return [...staticEntries, ...productEntries];
}
