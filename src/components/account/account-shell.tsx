"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, MapPin, ShoppingBag } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useLocale } from "@/components/locale-provider";
import { customerSignOutAction } from "@/lib/auth/customer-actions";

export function AccountShell({ locale, user, children }: { locale: string; user: { name?: string | null; email?: string | null }; children: React.ReactNode }) {
  const { isArabic } = useLocale();
  const pathname = usePathname();

  const nav = [
    { href: `/${locale}/account`, icon: LayoutDashboard, en: "Dashboard", ar: "لوحة التحكم" },
    { href: `/${locale}/account/orders`, icon: ShoppingBag, en: "Orders", ar: "الطلبات" },
    { href: `/${locale}/account/addresses`, icon: MapPin, en: "Addresses", ar: "العناوين" },
  ];

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>
      <section className="mx-auto max-w-[1440px] px-6 py-10 lg:px-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-5">
            <div>
              <p className="truncate text-sm font-semibold text-white/90">{user.name || user.email}</p>
              <p className="truncate text-xs text-white/40">{user.email}</p>
            </div>
            <nav className="space-y-1 border-t border-white/10 pt-4">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition ${active ? "bg-[#22d3ee]/10 text-[#22d3ee]" : "text-white/55 hover:text-white"}`}>
                    <item.icon size={15} /> {isArabic ? item.ar : item.en}
                  </Link>
                );
              })}
              <form action={customerSignOutAction}>
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-medium text-white/55 transition hover:text-red-300">
                  <LogOut size={15} /> {isArabic ? "تسجيل الخروج" : "Sign out"}
                </button>
              </form>
            </nav>
          </aside>
          <div>{children}</div>
        </div>
      </section>
    </main>
  );
}
