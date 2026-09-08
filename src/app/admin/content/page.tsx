"use client";

import { useLocale } from "@/components/locale-provider";
import { FileText } from "lucide-react";

const pages = [
  { slug: "about", en: "About", ar: "من نحن" },
  { slug: "contact", en: "Contact", ar: "تواصل معنا" },
  { slug: "faq", en: "FAQ", ar: "الأسئلة الشائعة" },
  { slug: "shipping", en: "Shipping", ar: "الشحن" },
  { slug: "returns", en: "Returns", ar: "الإرجاع" },
  { slug: "warranty", en: "Warranty", ar: "الضمان" },
  { slug: "privacy", en: "Privacy", ar: "الخصوصية" },
  { slug: "terms", en: "Terms", ar: "الشروط" },
];

export default function AdminContentPage() {
  const { isArabic } = useLocale();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "إدارة المحتوى" : "CMS"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "المحتوى" : "Content"}</h1>
        <p className="mt-1 text-xs text-white/40">{isArabic ? "صفحات ثابتة بالإنجليزية والعربية — التحرير الفعلي يتوفر بعد ربط قاعدة البيانات." : "Static bilingual pages — editing unlocks once the Page/PageTranslation models are connected to a live database."}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pages.map((page) => (
          <div key={page.slug} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101416] p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#22d3ee]/12 text-[#22d3ee]"><FileText size={15} strokeWidth={1.5} /></span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/85">{isArabic ? page.ar : page.en}</p>
              <p className="text-[10px] uppercase tracking-[0.1em] text-white/35">/{page.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
