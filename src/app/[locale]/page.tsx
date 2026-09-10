import type { Metadata } from "next";
import { getPublicProducts } from "@/actions/products";
import { getHomepageSections } from "@/actions/homepage";
import { getPublicHeroCampaigns } from "@/actions/hero-campaigns";
import { HomeContent } from "@/components/home/home-content";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const title = isArabic ? "CELIBERY | صوت بلا حدود" : "CELIBERY | Sound Without Limits";
  const description = isArabic
    ? "صوت فاخر مصمم للحياة اليومية. سماعات رأس وأذن ومكبرات صوت من CELIBERY في المملكة العربية السعودية."
    : "Premium audio engineered for everyday life. CELIBERY headphones, earbuds, and speakers in Saudi Arabia.";
  return { title, description, alternates: { canonical: `/${locale}` } };
}

export default async function Home() {
  const [products, sections, heroSlides] = await Promise.all([getPublicProducts(), getHomepageSections(), getPublicHeroCampaigns()]);
  return <HomeContent products={products} sections={sections} heroSlides={heroSlides} />;
}
