"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export default function AdminSettingsPage() {
  const { isArabic } = useLocale();
  const [siteName, setSiteName] = useState("CELIBERY");
  const [supportEmail, setSupportEmail] = useState("support@celibery.sa");
  const [currency, setCurrency] = useState("SAR");
  const [defaultCountry, setDefaultCountry] = useState("Saudi Arabia");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "الإعدادات" : "Configuration"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "إعدادات الموقع" : "Site settings"}</h1>
      </div>

      <div className="max-w-lg space-y-4 rounded-xl border border-white/10 bg-[#101416] p-5">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "اسم الموقع" : "Site name"}</span>
          <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="admin-input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "بريد الدعم" : "Support email"}</span>
          <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="admin-input" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "العملة" : "Currency"}</span>
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="admin-input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "الدولة الافتراضية" : "Default country"}</span>
            <input value={defaultCountry} onChange={(e) => setDefaultCountry(e.target.value)} className="admin-input" />
          </label>
        </div>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}
          className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white"
        >
          <Save size={14} /> {saved ? (isArabic ? "تم الحفظ" : "Saved") : (isArabic ? "حفظ" : "Save")}
        </button>
        <p className="text-[10px] text-white/30">{isArabic ? "سيتم حفظ هذه القيم في SiteSettings عند ربط قاعدة البيانات." : "These values will persist to the SiteSettings model once the database is connected."}</p>
      </div>
    </div>
  );
}
