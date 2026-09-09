"use client";

import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { useLocale } from "@/components/locale-provider";
import type { PublicContentPage } from "@/actions/content-pages";

export function StaticPage({ page }: { page: PublicContentPage | null }) {
  const { isArabic, locale } = useLocale();

  if (!page) {
    return (
      <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
        <header className="border-b border-white/10"><SiteNav /></header>
        <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-white/50">{isArabic ? "الصفحة غير موجودة." : "Page not found."}</p>
          <Link href={`/${locale}`} className="mt-7 text-xs font-semibold text-[#22d3ee]">{isArabic ? "العودة للرئيسية" : "Back to home"}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>
      <article className="mx-auto max-w-3xl px-6 py-16 lg:px-0 lg:py-24">
        <h1 className="display-font text-4xl font-semibold uppercase leading-[0.95] sm:text-6xl">{page.title}</h1>
        <div className="mt-10 whitespace-pre-line text-base leading-8 text-white/70">{page.content}</div>
      </article>
    </main>
  );
}
