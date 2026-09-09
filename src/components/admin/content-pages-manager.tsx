"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { upsertAdminContentPageAction, deleteAdminContentPageAction, type AdminContentPage } from "@/actions/content-pages";

const SUGGESTED_SLUGS = ["about", "contact", "faq", "shipping", "returns", "warranty", "privacy", "terms"];

function blankPage(slug = ""): AdminContentPage {
  return { id: "", slug, status: "draft", updatedAt: "", en: { title: "", content: "", seoTitle: "", seoDescription: "" }, ar: { title: "", content: "", seoTitle: "", seoDescription: "" } };
}

export function ContentPagesManager({ pages }: { pages: AdminContentPage[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(pages[0]?.id ?? null);
  const [draft, setDraft] = useState<AdminContentPage>(pages[0] ?? blankPage());
  const [tabLocale, setTabLocale] = useState<"en" | "ar">("en");
  const [error, setError] = useState<string | null>(null);

  const select = (page: AdminContentPage | null) => {
    setSelectedId(page?.id ?? null);
    setDraft(page ?? blankPage());
    setError(null);
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await upsertAdminContentPageAction(draft);
      if (result.error) { setError(result.error); return; }
      router.refresh();
    });
  };

  const runAction = (action: () => Promise<unknown>) => startTransition(async () => { await action(); router.refresh(); });

  const existingSlugs = new Set(pages.map((p) => p.slug));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "المحتوى" : "Content"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "الصفحات" : "Pages"}</h1>
        <p className="mt-1 text-xs text-white/40">{isArabic ? "من نحن، الأسئلة الشائعة، الخصوصية، الشروط وغيرها." : "About, FAQ, Privacy, Terms, and other static pages."}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2 rounded-xl border border-white/10 bg-[#101416] p-3">
          <button onClick={() => select(null)} className="mb-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2 text-[11px] font-semibold text-[#22d3ee] transition hover:border-[#22d3ee]/50"><Plus size={13} /> {isArabic ? "صفحة جديدة" : "New page"}</button>
          {pages.map((page) => (
            <div key={page.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition ${selectedId === page.id ? "border-[#22d3ee]/50 bg-[#22d3ee]/8" : "border-transparent hover:bg-white/5"}`}>
              <button onClick={() => select(page)} className="min-w-0 flex-1 text-start">
                <p className="truncate text-xs font-medium text-white/85">{page.en.title || `/${page.slug}`}</p>
                <p className="text-[10px] text-white/35">/{page.slug} · {page.status}</p>
              </button>
              <button aria-label="Delete" disabled={isPending} onClick={() => { if (confirm("Delete this page?")) { runAction(() => deleteAdminContentPageAction(page.id)); if (selectedId === page.id) select(null); } }} className="grid size-7 shrink-0 place-items-center rounded-md text-white/40 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 size={13} /></button>
            </div>
          ))}

          {SUGGESTED_SLUGS.some((slug) => !existingSlugs.has(slug)) && (
            <div className="px-2 py-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-white/35">{isArabic ? "صفحات مقترحة" : "Suggested pages"}</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SLUGS.filter((slug) => !existingSlugs.has(slug)).map((slug) => (
                  <button key={slug} onClick={() => select(blankPage(slug))} className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-white/50 transition hover:border-[#22d3ee]/50 hover:text-[#22d3ee]">/{slug}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-white/10 bg-[#101416] p-5">
          {error && <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex gap-1 rounded-lg bg-white/5 p-1">
              <button onClick={() => setTabLocale("en")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tabLocale === "en" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>ENGLISH</button>
              <button onClick={() => setTabLocale("ar")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tabLocale === "ar" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>العربية</button>
            </div>
            <div className="flex items-center gap-3">
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as AdminContentPage["status"] })} className="admin-input w-auto py-1.5">
                <option value="draft">{isArabic ? "مسودة" : "Draft"}</option>
                <option value="published">{isArabic ? "منشور" : "Published"}</option>
              </select>
              <button onClick={save} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2 text-xs font-semibold text-[#080a0c] transition hover:bg-white disabled:opacity-60"><Save size={13} /> {isPending ? "..." : (isArabic ? "حفظ" : "Save")}</button>
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "الرابط" : "Slug"}</span>
            <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="admin-input font-mono" placeholder="about" disabled={!!draft.id} />
          </label>

          {tabLocale === "en" ? (
            <>
              <Field label="Title"><input value={draft.en.title} onChange={(e) => setDraft({ ...draft, en: { ...draft.en, title: e.target.value } })} className="admin-input" /></Field>
              <Field label="Content"><textarea value={draft.en.content} onChange={(e) => setDraft({ ...draft, en: { ...draft.en, content: e.target.value } })} rows={12} className="admin-input resize-none" /></Field>
            </>
          ) : (
            <div dir="rtl" className="space-y-4">
              <Field label="العنوان"><input value={draft.ar.title} onChange={(e) => setDraft({ ...draft, ar: { ...draft.ar, title: e.target.value } })} className="admin-input text-right" /></Field>
              <Field label="المحتوى"><textarea value={draft.ar.content} onChange={(e) => setDraft({ ...draft, ar: { ...draft.ar, content: e.target.value } })} rows={12} className="admin-input resize-none text-right" /></Field>
            </div>
          )}
        </div>
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
