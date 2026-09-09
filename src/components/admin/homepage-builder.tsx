"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Save } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import {
  reorderHomepageSectionsAction,
  toggleHomepageSectionAction,
  updateHomepageSectionAction,
  type HomepageSection,
} from "@/actions/homepage";

const SECTION_LABELS: Record<HomepageSection["type"], { en: string; ar: string }> = {
  hero: { en: "Hero Banner", ar: "بانر الصفحة الرئيسية" },
  featured: { en: "Featured Product", ar: "المنتج المميز" },
  categories: { en: "Categories", ar: "الفئات" },
  technology: { en: "Technology / Why Us", ar: "التقنية / لماذا نحن" },
  "best-sellers": { en: "Best Sellers", ar: "الأكثر مبيعاً" },
  promotions: { en: "Promotions", ar: "العروض" },
  lifestyle: { en: "Lifestyle", ar: "أسلوب الحياة" },
  reviews: { en: "Reviews", ar: "التقييمات" },
  blog: { en: "Blog", ar: "المدونة" },
  newsletter: { en: "Newsletter", ar: "النشرة البريدية" },
};

export function HomepageBuilder({ sections }: { sections: HomepageSection[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(sections[0]?.id ?? "hero");
  const [tab, setTab] = useState<"en" | "ar">("en");
  const persisted = sections.find((section) => section.id === selectedId) ?? sections[0];
  const [draft, setDraft] = useState<HomepageSection | undefined>(persisted);

  // Reset the draft when the selection changes (React "adjust state during render" pattern).
  const [renderedSelectedId, setRenderedSelectedId] = useState(selectedId);
  if (renderedSelectedId !== selectedId) {
    setRenderedSelectedId(selectedId);
    setDraft(persisted);
  }

  const toggle = (id: string) => {
    startTransition(async () => {
      await toggleHomepageSectionAction(id);
      router.refresh();
    });
  };

  const move = (id: string, direction: -1 | 1) => {
    const index = sections.findIndex((section) => section.id === id);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= sections.length) return;
    const next = [...sections];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    startTransition(async () => {
      await reorderHomepageSectionsAction(next.map((section) => section.id));
      router.refresh();
    });
  };

  const save = () => {
    if (!draft) return;
    startTransition(async () => {
      await updateHomepageSectionAction(draft);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "بناء الصفحة" : "Page builder"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "الصفحة الرئيسية" : "Homepage"}</h1>
          <p className="mt-1 text-xs text-white/40">{isArabic ? "فعّل، رتّب، وحرّر أقسام الصفحة الرئيسية دون لمس الكود." : "Enable, reorder, and edit homepage sections without touching code."}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2 rounded-xl border border-white/10 bg-[#101416] p-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 transition ${selectedId === section.id ? "border-[#22d3ee]/50 bg-[#22d3ee]/8" : "border-transparent hover:bg-white/5"}`}
            >
              <div className="flex flex-col gap-0.5">
                <button aria-label="Move up" onClick={() => move(section.id, -1)} disabled={index === 0 || isPending} className="text-white/30 transition hover:text-white disabled:opacity-20"><ArrowUp size={11} /></button>
                <button aria-label="Move down" onClick={() => move(section.id, 1)} disabled={index === sections.length - 1 || isPending} className="text-white/30 transition hover:text-white disabled:opacity-20"><ArrowDown size={11} /></button>
              </div>
              <button onClick={() => setSelectedId(section.id)} className="min-w-0 flex-1 text-start">
                <p className="truncate text-xs font-medium text-white/85">{isArabic ? SECTION_LABELS[section.type].ar : SECTION_LABELS[section.type].en}</p>
                <p className="text-[10px] text-white/35">{section.enabled ? (isArabic ? "مفعّل" : "Enabled") : (isArabic ? "معطّل" : "Disabled")}</p>
              </button>
              <button
                role="switch"
                aria-checked={section.enabled}
                aria-label={`Toggle ${section.type}`}
                onClick={() => toggle(section.id)}
                disabled={isPending}
                className={`relative h-5 w-9 shrink-0 rounded-full transition disabled:opacity-50 ${section.enabled ? "bg-[#22d3ee]" : "bg-white/15"}`}
              >
                <span className={`absolute top-0.5 size-4 rounded-full bg-[#080a0c] transition ${section.enabled ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>

        {draft && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-sm font-semibold text-white/85">{isArabic ? SECTION_LABELS[draft.type].ar : SECTION_LABELS[draft.type].en}</h2>
                <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                  <button onClick={() => setTab("en")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tab === "en" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>ENGLISH</button>
                  <button onClick={() => setTab("ar")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tab === "ar" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>العربية</button>
                </div>
              </div>

              {tab === "en" ? (
                <div className="space-y-4">
                  <LabeledInput label="Title" value={draft.en.title} onChange={(title) => setDraft({ ...draft, en: { ...draft.en, title } })} />
                  <LabeledInput label="Subtitle" value={draft.en.subtitle} onChange={(subtitle) => setDraft({ ...draft, en: { ...draft.en, subtitle } })} />
                  <LabeledInput label="Button label" value={draft.en.ctaLabel} onChange={(ctaLabel) => setDraft({ ...draft, en: { ...draft.en, ctaLabel } })} />
                </div>
              ) : (
                <div className="space-y-4" dir="rtl">
                  <LabeledInput label="العنوان" value={draft.ar.title} onChange={(title) => setDraft({ ...draft, ar: { ...draft.ar, title } })} align="right" />
                  <LabeledInput label="العنوان الفرعي" value={draft.ar.subtitle} onChange={(subtitle) => setDraft({ ...draft, ar: { ...draft.ar, subtitle } })} align="right" />
                  <LabeledInput label="نص الزر" value={draft.ar.ctaLabel} onChange={(ctaLabel) => setDraft({ ...draft, ar: { ...draft.ar, ctaLabel } })} align="right" />
                </div>
              )}

              <button onClick={save} disabled={isPending} className="mt-5 flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                <Save size={14} /> {isPending ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : (isArabic ? "حفظ" : "Save")}
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0a0d0f] p-8">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">{isArabic ? "معاينة مباشرة" : "Live preview"}</p>
              <div className="rounded-xl border border-white/10 bg-[#080a0c] p-8 text-center" dir={tab === "ar" ? "rtl" : "ltr"}>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">CELIBERY</p>
                <h3 className="display-font text-3xl font-semibold uppercase">{tab === "ar" ? draft.ar.title : draft.en.title}</h3>
                <p className="mx-auto mt-3 max-w-sm text-xs text-white/50">{tab === "ar" ? draft.ar.subtitle : draft.en.subtitle}</p>
                {(tab === "ar" ? draft.ar.ctaLabel : draft.en.ctaLabel) && (
                  <span className="mt-5 inline-flex items-center gap-2 bg-[#22d3ee] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#080a0c]">
                    {tab === "ar" ? draft.ar.ctaLabel : draft.en.ctaLabel} <ArrowUpRight size={13} />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, align }: { label: string; value: string; onChange: (value: string) => void; align?: "right" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={`admin-input ${align === "right" ? "text-right" : ""}`} />
    </label>
  );
}
