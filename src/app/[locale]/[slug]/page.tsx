import type { Metadata } from "next";
import { getPublicContentPageBySlug } from "@/actions/content-pages";
import { StaticPage } from "@/components/content/static-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = await getPublicContentPageBySlug(slug, locale as "en" | "ar");
  if (!page) return { title: "Page not found | CELIBERY" };

  const title = page.seoTitle || `${page.title} | CELIBERY`;
  return { title, description: page.seoDescription || undefined, alternates: { canonical: `/${locale}/${slug}` } };
}

export default async function ContentPage({ params }: PageProps<"/[locale]/[slug]">) {
  const { slug, locale } = await params;
  const page = await getPublicContentPageBySlug(slug, locale as "en" | "ar");
  return <StaticPage page={page} />;
}
