"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Bot,
  Clapperboard,
  LayoutDashboard,
  LayoutTemplate,
  LibraryBig,
  LogOut,
  Megaphone,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Ticket,
  Truck,
  Users,
} from "lucide-react";
import { useLocale, LanguageToggle } from "@/components/locale-provider";
import { signOutAction } from "@/lib/auth/actions";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, en: "Dashboard", ar: "لوحة التحكم" },
  { href: "/admin/products", icon: Package, en: "Products", ar: "المنتجات" },
  { href: "/admin/orders", icon: ShoppingCart, en: "Orders", ar: "الطلبات" },
  { href: "/admin/customers", icon: Users, en: "Customers", ar: "العملاء" },
  { href: "/admin/reviews", icon: Star, en: "Reviews", ar: "التقييمات" },
  { href: "/admin/coupons", icon: Ticket, en: "Coupons", ar: "القسائم" },
  { href: "/admin/promotions", icon: Megaphone, en: "Promotions", ar: "العروض" },
  { href: "/admin/hero", icon: Clapperboard, en: "Hero Campaigns", ar: "حملات البطل" },
  { href: "/admin/homepage", icon: LayoutTemplate, en: "Homepage", ar: "الصفحة الرئيسية" },
  { href: "/admin/content", icon: BookOpen, en: "Content", ar: "المحتوى" },
  { href: "/admin/chatbot", icon: Bot, en: "Chatbot", ar: "المساعد الذكي" },
  { href: "/admin/knowledge", icon: LibraryBig, en: "Knowledge Base", ar: "قاعدة المعرفة" },
  { href: "/admin/shipping", icon: Truck, en: "Shipping", ar: "الشحن" },
  { href: "/admin/analytics", icon: BarChart3, en: "Analytics", ar: "التحليلات" },
  { href: "/admin/settings", icon: Settings, en: "Settings", ar: "الإعدادات" },
] as const;

type AdminUser = { name?: string | null; email?: string | null; role: string };

export function AdminShell({ children, user }: { children: React.ReactNode; user: AdminUser }) {
  const { isArabic } = useLocale();
  const pathname = usePathname();
  const displayName = user.name || user.email || "Admin";
  const initial = displayName.charAt(0).toUpperCase();
  const roleLabel = user.role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#080a0c] text-[#f3f5f5]" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 flex-col border-e border-white/10 bg-[#0a0d0f] lg:flex">
          <div className="flex items-center gap-2.5 border-b border-white/10 px-6 py-6">
            <Image src="/celibery-logo.svg" alt="CELIBERY" width={120} height={30} className="brand-logo" />
            <span className="rounded-full border border-[#22d3ee]/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#22d3ee]">Admin</span>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
            {NAV.map(({ href, icon: Icon, en, ar }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-[#22d3ee]/12 text-[#22d3ee]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon size={16} strokeWidth={1.6} />
                  {isArabic ? ar : en}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 px-4 py-4 text-[10px] uppercase tracking-[0.14em] text-white/30">CELIBERY / Saudi Arabia</div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#0a0d0f] px-5 py-3.5 lg:px-8">
            <label className="flex min-w-0 max-w-sm flex-1 items-center gap-2 rounded-lg border border-white/12 bg-[#101416] px-3 py-2 text-white/40 focus-within:border-[#22d3ee]">
              <Search size={14} />
              <input placeholder={isArabic ? "بحث..." : "Search..."} className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30" />
            </label>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <div className="flex items-center gap-2 rounded-full border border-white/12 py-1 pe-3 ps-1.5" title={roleLabel}>
                <span className="grid size-6 place-items-center rounded-full bg-[#22d3ee] text-[10px] font-bold text-[#080a0c]">{initial}</span>
                <span className="max-w-28 truncate text-[11px] font-medium text-white/70">{displayName}</span>
              </div>
              <form action={signOutAction}>
                <button type="submit" aria-label={isArabic ? "تسجيل الخروج" : "Sign out"} className="grid size-9 place-items-center rounded-full border border-white/12 text-white/60 transition hover:border-red-400/50 hover:text-red-300">
                  <LogOut size={15} strokeWidth={1.6} />
                </button>
              </form>
            </div>
          </header>
          <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
