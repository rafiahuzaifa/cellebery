"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type Locale = "en" | "ar";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isArabic: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function NavigableLocaleProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const value = useMemo<LocaleContextValue>(() => {
    const setLocale = (nextLocale: Locale) => {
      const segments = pathname.split("/");
      // segments[0] is "" (leading slash), segments[1] is the current locale.
      segments[1] = nextLocale;
      // Read the query string at click time rather than subscribing to
      // useSearchParams(), which would force every page under this
      // provider out of static rendering.
      const query = typeof window !== "undefined" ? window.location.search : "";
      router.push(`${segments.join("/") || "/"}${query}`);
    };

    return { locale: initialLocale, setLocale, isArabic: initialLocale === "ar" };
  }, [initialLocale, pathname, router]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function StaticLocaleProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const value = useMemo<LocaleContextValue>(() => ({ locale, setLocale, isArabic: locale === "ar" }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * `navigable` (default true) means locale lives in the URL's first segment
 * (the storefront's /[locale]/... routes) — switching pushes a real
 * navigation. Pass `navigable={false}` for trees with no locale segment
 * (the admin panel), where switching is just local UI state and avoids
 * any navigation-hook usage (keeping those pages statically prerenderable).
 */
export function LocaleProvider({ children, initialLocale, navigable = true }: { children: React.ReactNode; initialLocale: Locale; navigable?: boolean }) {
  return navigable
    ? <NavigableLocaleProvider initialLocale={initialLocale}>{children}</NavigableLocaleProvider>
    : <StaticLocaleProvider initialLocale={initialLocale}>{children}</StaticLocaleProvider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/15 p-1 text-[9px] font-bold tracking-[0.12em]">
      <button aria-label="Switch to English" onClick={() => setLocale("en")} className={`rounded-full px-2 py-1 transition ${locale === "en" ? "bg-white text-[#080a0c]" : "text-white/45 hover:text-white"}`}>EN</button>
      <button aria-label="Switch to Arabic" onClick={() => setLocale("ar")} className={`rounded-full px-2 py-1 transition ${locale === "ar" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/45 hover:text-white"}`}>العربية</button>
    </div>
  );
}
