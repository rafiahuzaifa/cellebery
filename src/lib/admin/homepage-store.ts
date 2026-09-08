"use client";

import { useSyncExternalStore } from "react";
import { createLocalStorageList } from "@/lib/local-storage-list";

export type HomepageSection = {
  id: string;
  type: "hero" | "featured" | "categories" | "technology" | "best-sellers" | "promotions" | "lifestyle" | "reviews" | "blog" | "newsletter";
  enabled: boolean;
  en: { title: string; subtitle: string; ctaLabel: string };
  ar: { title: string; subtitle: string; ctaLabel: string };
};

const seedSections: HomepageSection[] = [
  { id: "hero", type: "hero", enabled: true, en: { title: "Sound without limits", subtitle: "Premium audio engineered for everyday life.", ctaLabel: "Explore collection" }, ar: { title: "صوت بلا حدود", subtitle: "صوت فاخر مصمم لحياتك اليومية.", ctaLabel: "استكشف المجموعة" } },
  { id: "featured", type: "featured", enabled: true, en: { title: "Hear every detail", subtitle: "The signature series / X7 Pro", ctaLabel: "Discover X7 Pro" }, ar: { title: "اسمع كل تفصيل", subtitle: "السلسلة المميزة / X7 Pro", ctaLabel: "اكتشف X7 Pro" } },
  { id: "categories", type: "categories", enabled: true, en: { title: "Choose your sound", subtitle: "Headphones, earbuds, and speakers.", ctaLabel: "View all products" }, ar: { title: "اختر صوتك", subtitle: "سماعات الرأس والأذن ومكبرات الصوت.", ctaLabel: "عرض كل المنتجات" } },
  { id: "technology", type: "technology", enabled: true, en: { title: "Why choose CELIBERY?", subtitle: "Premium sound, modern design, all-day comfort.", ctaLabel: "" }, ar: { title: "لماذا تختار سيليبري؟", subtitle: "صوت فاخر، تصميم عصري، راحة طوال اليوم.", ctaLabel: "" } },
  { id: "best-sellers", type: "best-sellers", enabled: true, en: { title: "Best sellers", subtitle: "Most wanted CELIBERY products.", ctaLabel: "View all products" }, ar: { title: "الأكثر مبيعاً", subtitle: "منتجات سيليبري الأكثر طلباً.", ctaLabel: "عرض كل المنتجات" } },
  { id: "lifestyle", type: "lifestyle", enabled: true, en: { title: "Designed for your life", subtitle: "Travel, work, fitness, and home.", ctaLabel: "" }, ar: { title: "مصمم لحياتك", subtitle: "السفر والعمل واللياقة والمنزل.", ctaLabel: "" } },
  { id: "promotions", type: "promotions", enabled: false, en: { title: "Limited time offer", subtitle: "Save on select CELIBERY audio.", ctaLabel: "Shop the sale" }, ar: { title: "عرض لفترة محدودة", subtitle: "وفر على منتجات مختارة من سيليبري.", ctaLabel: "تسوق العرض" } },
  { id: "reviews", type: "reviews", enabled: false, en: { title: "Loved across Saudi Arabia", subtitle: "4.9 out of 5 from verified customers.", ctaLabel: "" }, ar: { title: "محبوب في أنحاء المملكة", subtitle: "4.9 من 5 من عملاء موثقين.", ctaLabel: "" } },
  { id: "blog", type: "blog", enabled: false, en: { title: "CELIBERY Journal", subtitle: "Stories on sound, design, and craft.", ctaLabel: "Read the journal" }, ar: { title: "مجلة سيليبري", subtitle: "قصص عن الصوت والتصميم والحرفية.", ctaLabel: "اقرأ المجلة" } },
  { id: "newsletter", type: "newsletter", enabled: true, en: { title: "Stay in the loop", subtitle: "New drops and offers, straight to your inbox.", ctaLabel: "Subscribe" }, ar: { title: "ابق على اطلاع", subtitle: "أحدث الإصدارات والعروض في بريدك.", ctaLabel: "اشترك" } },
];

const store = createLocalStorageList<HomepageSection>("celibery-homepage-sections", seedSections);

export function useHomepageSections() {
  const sections = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const toggle = (id: string) => store.set(sections.map((section) => section.id === id ? { ...section, enabled: !section.enabled } : section));

  const move = (id: string, direction: -1 | 1) => {
    const index = sections.findIndex((section) => section.id === id);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= sections.length) return;
    const next = [...sections];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    store.set(next);
  };

  const update = (section: HomepageSection) => store.set(sections.map((entry) => entry.id === section.id ? section : entry));

  return { sections, toggle, move, update };
}
