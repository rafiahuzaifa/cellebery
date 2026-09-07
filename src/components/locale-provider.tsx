"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Locale = "en" | "ar";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isArabic: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("celibery-locale", locale);
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem("celibery-locale", nextLocale);
  };

  return <LocaleContext.Provider value={{ locale, setLocale, isArabic: locale === "ar" }}>{children}</LocaleContext.Provider>;
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
      <button aria-label="Switch to Arabic" onClick={() => setLocale("ar")} className={`rounded-full px-2 py-1 transition ${locale === "ar" ? "bg-[#9ff6ed] text-[#080a0c]" : "text-white/45 hover:text-white"}`}>العربية</button>
    </div>
  );
}
