"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Check, Save } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { updateSiteSettingsAction, type SiteSettings } from "@/actions/settings";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const { isArabic } = useLocale();
  const [settings, setSettings] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSiteSettingsAction(settings);
      if (result.error) { setError(result.error); return; }
      setSaved(true);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "الإعدادات" : "Configuration"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "إعدادات الموقع" : "Site settings"}</h1>
      </div>

      <div className="max-w-lg space-y-4 rounded-xl border border-white/10 bg-[#101416] p-5">
        <Field label={isArabic ? "اسم الموقع" : "Site name"}><input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="admin-input" /></Field>
        <Field label={isArabic ? "بريد الدعم" : "Support email"}><input type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} className="admin-input" /></Field>
        <Field label={isArabic ? "واتساب الدعم" : "Support WhatsApp"}><input value={settings.supportWhatsapp} onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })} className="admin-input" placeholder="+966 5xxxxxxxx" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={isArabic ? "العملة" : "Currency"}><input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="admin-input" /></Field>
          <Field label={isArabic ? "الدولة الافتراضية" : "Default country"}><input value={settings.defaultCountry} onChange={(e) => setSettings({ ...settings, defaultCountry: e.target.value })} className="admin-input" /></Field>
        </div>

        {error && <p className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300"><AlertCircle size={13} /> {error}</p>}
        {saved && <p className="flex items-center gap-2 text-xs text-emerald-300"><Check size={14} /> {isArabic ? "تم الحفظ." : "Saved."}</p>}

        <button onClick={save} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white disabled:opacity-60"><Save size={14} /> {isPending ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : (isArabic ? "حفظ" : "Save")}</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{label}</span>
      {children}
    </label>
  );
}
