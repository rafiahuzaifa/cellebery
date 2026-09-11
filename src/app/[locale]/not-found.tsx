"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const isArabic = pathname?.startsWith("/ar");
  const locale = isArabic ? "ar" : "en";

  const copy = isArabic ? {
    tagline: "صوت بلا حدود",
    message: "الإشارة التي طلبتها غير متوفرة.",
    home: "العودة إلى الرئيسية",
    shop: "تسوق المجموعة",
  } : {
    tagline: "SOUND WITHOUT LIMITS",
    message: "The signal you requested is not available.",
    home: "Return home",
    shop: "Shop collection",
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#080a0c] text-[#f3f5f5]">
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <div className="absolute inset-0 opacity-90">
          <div className="full-media absolute inset-0 bg-[url('/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_32%20PM.png')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080a0c]/80 via-[#080a0c]/70 to-[#080a0c]" />
        </div>

        <div className="relative z-10 max-w-2xl text-center">
          <div className="mb-8 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#22d3ee]">
            <span className="h-px w-10 bg-[#22d3ee]" />
            CELIBERY
            <span className="h-px w-10 bg-[#22d3ee]" />
          </div>
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
            {copy.tagline}
          </p>
          <h1 className="display-font text-7xl font-semibold uppercase leading-none sm:text-8xl">
            404
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/60">
            {copy.message}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${locale}`} className="inline-flex items-center justify-center rounded-full bg-[#22d3ee] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#080a0c] transition hover:shadow-[0_0_28px_rgba(34,211,238,0.45)]">
              {copy.home}
            </Link>
            <Link href={`/${locale}/shop`} className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:border-[#22d3ee] hover:text-[#22d3ee]">
              {copy.shop}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
