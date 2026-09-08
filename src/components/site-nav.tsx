"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageToggle, useLocale } from "@/components/locale-provider";
import { useCart } from "@/components/cart-provider";

export function SiteNav({ overlay = false }: { overlay?: boolean }) {
  const { isArabic } = useLocale();
  const { itemCount } = useCart();
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
  const navPosition = overlay ? "absolute inset-x-0 top-0" : "relative";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav className={`${navPosition} z-40 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-7 lg:px-12 ${textTone}`}>
        <Link href="/" aria-label="CELIBERY home" className="brand-mark shrink-0 text-white">
          <Image src="/celibery-logo.svg" alt="CELIBERY" width={150} height={40} className="brand-logo" />
        </Link>
        <div className="hidden items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.18em] lg:flex">
          {links.map(([label, href], index) => <Link key={label} className={index === 0 ? "text-white" : "text-white/60 transition hover:text-[#9ff6ed]"} href={href}>{label}</Link>)}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/shop#search" aria-label={isArabic ? "البحث" : "Search"} className={`grid size-10 place-items-center rounded-full border ${borderTone} text-white/75 transition hover:border-[#9ff6ed] hover:text-[#9ff6ed]`}><Search size={16} strokeWidth={1.5} /></Link>
          <Link href="/cart" aria-label={isArabic ? "السلة" : "Shopping bag"} className={`relative grid size-10 place-items-center rounded-full border ${borderTone} text-white/75 transition hover:border-[#9ff6ed] hover:text-[#9ff6ed]`}><ShoppingBag size={16} strokeWidth={1.5} />{itemCount > 0 && <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#9ff6ed] text-[8px] font-bold text-[#080a0c]">{itemCount}</span>}</Link>
          <button aria-label={isArabic ? "فتح القائمة" : "Open navigation"} className={`grid size-10 place-items-center rounded-full border ${borderTone} text-white/75 lg:hidden`} onClick={() => setMenuOpen(true)}><Menu size={17} strokeWidth={1.5} /></button>
          <LanguageToggle />
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && <motion.div className="fixed inset-0 z-50 overflow-y-auto bg-[#080a0c] p-6 lg:hidden" initial={{ opacity: 0, y: "-4%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "-4%" }} transition={{ duration: 0.25, ease: "easeOut" }}>
          <div className="flex items-center justify-between border-b border-white/10 pb-6"><Link href="/" aria-label="CELIBERY home" className="brand-mark shrink-0 text-white" onClick={() => setMenuOpen(false)}><Image src="/celibery-logo.svg" alt="CELIBERY" width={150} height={40} className="brand-logo" /></Link><button aria-label={isArabic ? "إغلاق القائمة" : "Close navigation"} className="grid size-10 place-items-center rounded-full border border-white/15 text-white/75 transition hover:border-[#9ff6ed] hover:text-[#9ff6ed]" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
          <div className="mt-14 flex flex-col">{links.map(([label, href], index) => <Link key={label} href={href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-white/10 py-5 text-2xl font-light tracking-[-0.04em] transition-colors hover:text-[#9ff6ed]"><span className="flex items-center gap-4"><span className="text-[10px] font-semibold tracking-[0.18em] text-[#9ff6ed]">0{index + 1}</span>{label}</span><ArrowUpRight size={15} className="text-white/30" /></Link>)}</div>
          <p className="mt-12 text-[10px] uppercase tracking-[0.18em] text-white/35">CELIBERY / Saudi Arabia / 2026</p>
        </motion.div>}
      </AnimatePresence>
    </>
  );
}
