import type { MetadataRoute } from "next";
import { getPublicProducts } from "@/actions/products";
import { getPublicBlogPosts } from "@/actions/blog";

const LOCALES = ["en", "ar"] as const;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellebry.vercel.app";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, postsByLocale] = await Promise.all([
    getPublicProducts(),
    Promise.all(LOCALES.map((locale) => getPublicBlogPosts(locale))),
  ]);

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => [
    { url: `${base}/${locale}`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/${locale}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/${locale}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ]);

  const productEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    products.map((product) => ({
      url: `${base}/${locale}/shop/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  const blogEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale, index) =>
    postsByLocale[index].map((post) => ({
      url: `${base}/${locale}/blog/${post.slug}`,
      lastModified: post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  );

  return [...staticEntries, ...productEntries, ...blogEntries];
}
