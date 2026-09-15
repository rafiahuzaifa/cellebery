"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LanguageToggle, useLocale } from "@/components/locale-provider";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { getPublicNavItems, type PublicNavItem } from "@/actions/navigation";

// Shown until the DB-backed nav items load client-side (see the effect below) —
// keeps first paint identical to the admin-managed default so there's no flash.
const FALLBACK_NAV_ITEMS: PublicNavItem[] = [
  { id: "shop", en: "Shop", ar: "المتجر", path: "/shop", showInPrimary: true },
  { id: "headphones", en: "Headphones", ar: "سماعات الرأس", path: "/shop?category=headphones", showInPrimary: true },
  { id: "earbuds", en: "Earbuds", ar: "سماعات الأذن", path: "/shop?category=earbuds", showInPrimary: true },
  { id: "speakers", en: "Speakers", ar: "مكبرات الصوت", path: "/shop?category=speakers", showInPrimary: true },
  { id: "accessories", en: "Accessories", ar: "الإكسسوارات", path: "/shop?category=accessories", showInPrimary: false },
  { id: "new-arrivals", en: "New arrivals", ar: "وصل حديثاً", path: "/shop?sort=newest", showInPrimary: false },
  { id: "journal", en: "Journal", ar: "المجلة", path: "/blog", showInPrimary: false },
  { id: "story", en: "Our story", ar: "قصتنا", path: "#story", showInPrimary: true },
];

export function SiteNav({ overlay = false }: { overlay?: boolean }) {
  const { isArabic, locale } = useLocale();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<PublicNavItem[]>(FALLBACK_NAV_ITEMS);

  useEffect(() => {
    getPublicNavItems().then((items) => { if (items.length > 0) setNavItems(items); }).catch(() => {});
  }, []);

  // Full set (shown in the mobile/tablet drawer, where vertical space is cheap).
  const links = navItems.map((item) => [isArabic ? item.ar : item.en, `/${locale}${item.path}`] as const);
  // Trimmed set for the inline desktop row, admin-controlled via "show in
  // desktop row", so it reliably fits on one line instead of wrapping into
  // the hero — everything else stays one click away via the drawer above.
  const primaryLinks = navItems.filter((item) => item.showInPrimary).map((item) => [isArabic ? item.ar : item.en, `/${locale}${item.path}`] as const);
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
      <nav className={`${navPosition} z-50 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-7 lg:px-12 ${textTone}`}>
        <Link href={`/${locale}`} aria-label="CELIBERY home" className="brand-mark shrink-0 text-white">
          <Image src="/celibery-logo.svg" alt="CELIBERY" width={150} height={38} className="brand-logo" priority />
        </Link>
        <div className="hidden items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.14em] lg:flex">
          {primaryLinks.map(([label, href], index) => <Link key={label} className={index === 0 ? "text-white" : "text-white/60 transition hover:text-[#22d3ee]"} href={href}>{label}</Link>)}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/shop#search`} aria-label={isArabic ? "البحث" : "Search"} className={`grid size-10 place-items-center rounded-full border ${borderTone} text-white/75 transition hover:border-[#22d3ee] hover:text-[#22d3ee]`}><Search size={16} strokeWidth={1.5} /></Link>
          <Link href={session?.user ? `/${locale}/account` : `/${locale}/account/login`} aria-label={isArabic ? "حسابي" : "My account"} className={`hidden size-10 place-items-center rounded-full border ${borderTone} text-white/75 transition hover:border-[#22d3ee] hover:text-[#22d3ee] sm:grid`}><User size={16} strokeWidth={1.5} /></Link>
          <Link href={`/${locale}/wishlist`} aria-label={isArabic ? "المفضلة" : "Wishlist"} className={`relative hidden size-10 place-items-center rounded-full border ${borderTone} text-white/75 transition hover:border-[#22d3ee] hover:text-[#22d3ee] sm:grid`}><Heart size={16} strokeWidth={1.5} />{wishlistItems.length > 0 && <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#22d3ee] text-[8px] font-bold text-[#080a0c]">{wishlistItems.length}</span>}</Link>
          <Link href={`/${locale}/cart`} aria-label={isArabic ? "السلة" : "Shopping bag"} className={`relative grid size-10 place-items-center rounded-full border ${borderTone} text-white/75 transition hover:border-[#22d3ee] hover:text-[#22d3ee]`}><ShoppingBag size={16} strokeWidth={1.5} />{itemCount > 0 && <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#22d3ee] text-[8px] font-bold text-[#080a0c]">{itemCount}</span>}</Link>
          <button aria-label={isArabic ? "فتح القائمة" : "Open navigation"} className={`grid size-10 place-items-center rounded-full border ${borderTone} text-white/75 lg:hidden`} onClick={() => setMenuOpen(true)}><Menu size={17} strokeWidth={1.5} /></button>
          <LanguageToggle />
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && <motion.div className="fixed inset-0 z-50 overflow-y-auto bg-[#080a0c] p-6 lg:hidden" initial={{ opacity: 0, y: "-4%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "-4%" }} transition={{ duration: 0.25, ease: "easeOut" }}>
          <div className="flex items-center justify-between border-b border-white/10 pb-6"><Link href={`/${locale}`} aria-label="CELIBERY home" className="brand-mark shrink-0 text-white" onClick={() => setMenuOpen(false)}><Image src="/celibery-logo.svg" alt="CELIBERY" width={150} height={38} className="brand-logo" priority /></Link><button aria-label={isArabic ? "إغلاق القائمة" : "Close navigation"} className="grid size-10 place-items-center rounded-full border border-white/15 text-white/75 transition hover:border-[#22d3ee] hover:text-[#22d3ee]" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
          <div className="mt-14 flex flex-col">{links.map(([label, href], index) => <Link key={label} href={href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-white/10 py-5 text-2xl font-light tracking-[-0.04em] transition-colors hover:text-[#22d3ee]"><span className="flex items-center gap-4"><span className="text-[10px] font-semibold tracking-[0.18em] text-[#22d3ee]">0{index + 1}</span>{label}</span><ArrowUpRight size={15} className="text-white/30" /></Link>)}</div>
          <p className="mt-12 text-[10px] uppercase tracking-[0.18em] text-white/35">CELIBERY / Saudi Arabia / 2026</p>
        </motion.div>}
      </AnimatePresence>
    </>
  );
}
