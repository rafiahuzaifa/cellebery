"use client";

import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LanguageToggle, useLocale } from "@/components/locale-provider";

export function SiteNav({ overlay = false }: { overlay?: boolean }) {
  const { isArabic } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = isArabic
    ? [
        ["المتجر", "/shop"],
        ["سماعات الرأس", "/shop?category=headphones"],
        ["سماعات الأذن", "/shop?category=earbuds"],
        ["مكبرات الصوت", "/shop?category=speakers"],
        ["قصتنا", "/#story"],
      ]
    : [
        ["Shop", "/shop"],
        ["Headphones", "/shop?category=headphones"],
        ["Earbuds", "/shop?category=earbuds"],
        ["Speakers", "/shop?category=speakers"],
        ["Our story", "/#story"],
      ];
  const textTone = overlay ? "text-white" : "text-white/80";
  const borderTone = overlay ? "border-white/15" : "border-white/15";

  return (
    <>
      <nav className={`relative z-30 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-7 lg:px-12 ${textTone}`}>
        <Link href="/" className="text-lg font-bold tracking-[0.28em]">CELIBERY</Link>
        <div className="hidden items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.18em] lg:flex">
          {links.map(([label, href], index) => <Link key={label} className={index === 0 ? "text-white" : "text-white/60 transition hover:text-[#9ff6ed]"} href={href}>{label}</Link>)}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/shop#search" aria-label={isArabic ? "البحث" : "Search"} className={`hidden size-10 place-items-center rounded-full border ${borderTone} text-white/75 transition hover:border-[#9ff6ed] hover:text-[#9ff6ed] sm:grid`}><Search size={16} strokeWidth={1.5} /></Link>
          <Link href="/shop#cart" aria-label={isArabic ? "السلة" : "Shopping bag"} className={`grid size-10 place-items-center rounded-full border ${borderTone} text-white/75 transition hover:border-[#9ff6ed] hover:text-[#9ff6ed]`}><ShoppingBag size={16} strokeWidth={1.5} /></Link>
          <button aria-label={isArabic ? "فتح القائمة" : "Open navigation"} className={`grid size-10 place-items-center rounded-full border ${borderTone} text-white/75 lg:hidden`} onClick={() => setMenuOpen(true)}><Menu size={17} strokeWidth={1.5} /></button>
          <LanguageToggle />
        </div>
      </nav>

      {menuOpen && <div className="absolute inset-0 z-50 min-h-screen bg-[#080a0c] p-6 lg:hidden">
        <div className="flex items-center justify-between"><Link href="/" className="text-lg font-bold tracking-[0.28em]" onClick={() => setMenuOpen(false)}>CELIBERY</Link><button aria-label={isArabic ? "إغلاق القائمة" : "Close navigation"} className="grid size-10 place-items-center rounded-full border border-white/15" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
        <div className="mt-24 flex flex-col gap-7 text-4xl font-light tracking-[-0.06em]">{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</Link>)}</div>
      </div>}
    </>
  );
}
