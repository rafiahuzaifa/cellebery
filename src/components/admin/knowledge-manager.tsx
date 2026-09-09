"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import {
  upsertAdminFaqAction,
  deleteAdminFaqAction,
  upsertAdminKnowledgeArticleAction,
  deleteAdminKnowledgeArticleAction,
  testChatbotMessage,
  type AdminFaq,
  type AdminKnowledgeArticle,
} from "@/actions/knowledge";
import { KNOWLEDGE_CATEGORIES } from "@/lib/chatbot/knowledge-categories";

function blankFaq(): AdminFaq {
  return { id: "", category: "General", sortOrder: 0, active: true, en: { question: "", answer: "" }, ar: { question: "", answer: "" } };
}
function blankArticle(): AdminKnowledgeArticle {
  return { id: "", slug: "", category: "General", priority: 0, published: true, en: { title: "", body: "" }, ar: { title: "", body: "" } };
}

export function KnowledgeManager({ faqs, articles }: { faqs: AdminFaq[]; articles: AdminKnowledgeArticle[] }) {
  const { isArabic } = useLocale();
  const [tab, setTab] = useState<"faqs" | "articles" | "test">("faqs");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "المحتوى" : "Content"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "قاعدة المعرفة" : "Knowledge Base"}</h1>
        <p className="mt-1 text-xs text-white/40">{isArabic ? "الأسئلة الشائعة ومقالات السياسات التي يعتمد عليها مساعد CELIBERY AI." : "FAQs and policy articles CELIBERY AI relies on for honest answers."}</p>
      </div>

      <div className="flex gap-1 rounded-lg bg-white/5 p-1 w-fit">
        <button onClick={() => setTab("faqs")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tab === "faqs" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>{isArabic ? "الأسئلة الشائعة" : "FAQs"}</button>
        <button onClick={() => setTab("articles")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tab === "articles" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>{isArabic ? "المقالات" : "Articles"}</button>
        <button onClick={() => setTab("test")} className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold transition ${tab === "test" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}><Sparkles size={12} /> {isArabic ? "اختبار" : "Test"}</button>
      </div>

      {tab === "faqs" && <FaqEditor faqs={faqs} isArabic={isArabic} />}
      {tab === "articles" && <ArticleEditor articles={articles} isArabic={isArabic} />}
      {tab === "test" && <TestConsole isArabic={isArabic} />}
    </div>
  );
}

function FaqEditor({ faqs, isArabic }: { faqs: AdminFaq[]; isArabic: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(faqs[0]?.id ?? null);
  const [draft, setDraft] = useState<AdminFaq>(faqs[0] ?? blankFaq());
  const [tabLocale, setTabLocale] = useState<"en" | "ar">("en");
  const [error, setError] = useState<string | null>(null);

  const select = (faq: AdminFaq | null) => {
    setSelectedId(faq?.id ?? null);
    setDraft(faq ?? blankFaq());
    setError(null);
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await upsertAdminFaqAction(draft);
      if (result.error) { setError(result.error); return; }
      router.refresh();
    });
  };

  const runAction = (action: () => Promise<unknown>) => startTransition(async () => { await action(); router.refresh(); });

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="space-y-2 rounded-xl border border-white/10 bg-[#101416] p-3">
        <button onClick={() => select(null)} className="mb-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2 text-[11px] font-semibold text-[#22d3ee] transition hover:border-[#22d3ee]/50"><Plus size={13} /> {isArabic ? "سؤال جديد" : "New FAQ"}</button>
        {faqs.map((faq) => (
          <div key={faq.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition ${selectedId === faq.id ? "border-[#22d3ee]/50 bg-[#22d3ee]/8" : "border-transparent hover:bg-white/5"}`}>
            <button onClick={() => select(faq)} className="min-w-0 flex-1 text-start">
              <p className="truncate text-xs font-medium text-white/85">{faq.en.question || "(untitled)"}</p>
              <p className="text-[10px] text-white/35">{faq.category} · {faq.active ? (isArabic ? "مفعّل" : "Active") : (isArabic ? "معطّل" : "Inactive")}</p>
            </button>
            <button aria-label="Delete" disabled={isPending} onClick={() => { if (confirm("Delete this FAQ?")) { runAction(() => deleteAdminFaqAction(faq.id)); if (selectedId === faq.id) select(null); } }} className="grid size-7 shrink-0 place-items-center rounded-md text-white/40 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 bg-[#101416] p-5">
        {error && <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            <button onClick={() => setTabLocale("en")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tabLocale === "en" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>ENGLISH</button>
            <button onClick={() => setTabLocale("ar")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tabLocale === "ar" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>العربية</button>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[11px] text-white/50"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> {isArabic ? "مفعّل" : "Active"}</label>
            <button onClick={save} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2 text-xs font-semibold text-[#080a0c] transition hover:bg-white disabled:opacity-60"><Save size={13} /> {isPending ? "..." : (isArabic ? "حفظ" : "Save")}</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={isArabic ? "الفئة" : "Category"}>
            <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="admin-input">
              {KNOWLEDGE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label={isArabic ? "ترتيب العرض" : "Sort order"}>
            <input type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} className="admin-input" />
          </Field>
        </div>

        {tabLocale === "en" ? (
          <>
            <Field label="Question"><input value={draft.en.question} onChange={(e) => setDraft({ ...draft, en: { ...draft.en, question: e.target.value } })} className="admin-input" /></Field>
            <Field label="Answer"><textarea value={draft.en.answer} onChange={(e) => setDraft({ ...draft, en: { ...draft.en, answer: e.target.value } })} rows={4} className="admin-input resize-none" /></Field>
          </>
        ) : (
          <div dir="rtl" className="space-y-4">
            <Field label="السؤال"><input value={draft.ar.question} onChange={(e) => setDraft({ ...draft, ar: { ...draft.ar, question: e.target.value } })} className="admin-input text-right" /></Field>
            <Field label="الإجابة"><textarea value={draft.ar.answer} onChange={(e) => setDraft({ ...draft, ar: { ...draft.ar, answer: e.target.value } })} rows={4} className="admin-input resize-none text-right" /></Field>
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleEditor({ articles, isArabic }: { articles: AdminKnowledgeArticle[]; isArabic: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(articles[0]?.id ?? null);
  const [draft, setDraft] = useState<AdminKnowledgeArticle>(articles[0] ?? blankArticle());
  const [tabLocale, setTabLocale] = useState<"en" | "ar">("en");
  const [error, setError] = useState<string | null>(null);

  const select = (article: AdminKnowledgeArticle | null) => {
    setSelectedId(article?.id ?? null);
    setDraft(article ?? blankArticle());
    setError(null);
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await upsertAdminKnowledgeArticleAction(draft);
      if (result.error) { setError(result.error); return; }
      router.refresh();
    });
  };

  const runAction = (action: () => Promise<unknown>) => startTransition(async () => { await action(); router.refresh(); });

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="space-y-2 rounded-xl border border-white/10 bg-[#101416] p-3">
        <button onClick={() => select(null)} className="mb-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2 text-[11px] font-semibold text-[#22d3ee] transition hover:border-[#22d3ee]/50"><Plus size={13} /> {isArabic ? "مقالة جديدة" : "New article"}</button>
        {articles.map((article) => (
          <div key={article.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition ${selectedId === article.id ? "border-[#22d3ee]/50 bg-[#22d3ee]/8" : "border-transparent hover:bg-white/5"}`}>
            <button onClick={() => select(article)} className="min-w-0 flex-1 text-start">
              <p className="truncate text-xs font-medium text-white/85">{article.en.title || "(untitled)"}</p>
              <p className="text-[10px] text-white/35">{article.category} · {article.published ? (isArabic ? "منشور" : "Published") : (isArabic ? "مسودة" : "Draft")}</p>
            </button>
            <button aria-label="Delete" disabled={isPending} onClick={() => { if (confirm("Delete this article?")) { runAction(() => deleteAdminKnowledgeArticleAction(article.id)); if (selectedId === article.id) select(null); } }} className="grid size-7 shrink-0 place-items-center rounded-md text-white/40 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 bg-[#101416] p-5">
        {error && <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            <button onClick={() => setTabLocale("en")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tabLocale === "en" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>ENGLISH</button>
            <button onClick={() => setTabLocale("ar")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tabLocale === "ar" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>العربية</button>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[11px] text-white/50"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} /> {isArabic ? "منشور" : "Published"}</label>
            <button onClick={save} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2 text-xs font-semibold text-[#080a0c] transition hover:bg-white disabled:opacity-60"><Save size={13} /> {isPending ? "..." : (isArabic ? "حفظ" : "Save")}</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label={isArabic ? "الفئة" : "Category"}>
            <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="admin-input">
              {KNOWLEDGE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label={isArabic ? "الرابط" : "Slug"}>
            <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="admin-input font-mono" placeholder="auto-generated" />
          </Field>
          <Field label={isArabic ? "الأولوية" : "Priority"}>
            <input type="number" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: Number(e.target.value) })} className="admin-input" />
          </Field>
        </div>

        {tabLocale === "en" ? (
          <>
            <Field label="Title"><input value={draft.en.title} onChange={(e) => setDraft({ ...draft, en: { ...draft.en, title: e.target.value } })} className="admin-input" /></Field>
            <Field label="Body"><textarea value={draft.en.body} onChange={(e) => setDraft({ ...draft, en: { ...draft.en, body: e.target.value } })} rows={8} className="admin-input resize-none" /></Field>
          </>
        ) : (
          <div dir="rtl" className="space-y-4">
            <Field label="العنوان"><input value={draft.ar.title} onChange={(e) => setDraft({ ...draft, ar: { ...draft.ar, title: e.target.value } })} className="admin-input text-right" /></Field>
            <Field label="المحتوى"><textarea value={draft.ar.body} onChange={(e) => setDraft({ ...draft, ar: { ...draft.ar, body: e.target.value } })} rows={8} className="admin-input resize-none text-right" /></Field>
          </div>
        )}
      </div>
    </div>
  );
}

function TestConsole({ isArabic }: { isArabic: boolean }) {
  const [testLocale, setTestLocale] = useState<"en" | "ar">("en");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ message: string; intent: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = () => {
    if (!message.trim()) return;
    setResult(null);
    startTransition(async () => {
      const response = await testChatbotMessage(message, testLocale);
      setResult(response);
    });
  };

  return (
    <div className="max-w-2xl space-y-4 rounded-xl border border-white/10 bg-[#101416] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">{isArabic ? "اختبر كيف سيرد المساعد على سؤال حقيقي، باستخدام بيانات حقيقية فقط. لا يتم حفظ هذه المحادثة." : "Test how the assistant would answer a real question, using only real data. This conversation is not saved."}</p>
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          <button onClick={() => setTestLocale("en")} className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${testLocale === "en" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>EN</button>
          <button onClick={() => setTestLocale("ar")} className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${testLocale === "ar" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>AR</button>
        </div>
      </div>
      <div className="flex gap-2">
        <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder={isArabic ? "اكتب سؤالاً..." : "Type a question..."} className="admin-input flex-1" />
        <button onClick={run} disabled={isPending || !message.trim()} className="rounded-lg bg-[#22d3ee] px-4 py-2 text-xs font-semibold text-[#080a0c] transition hover:bg-white disabled:opacity-60">{isPending ? "..." : (isArabic ? "اسأل" : "Ask")}</button>
      </div>
      {result && (
        <div className="rounded-lg border border-white/10 bg-[#080a0c] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#22d3ee]">{isArabic ? "النية المصنفة:" : "Classified intent:"} {result.intent}</p>
          <p className="text-sm leading-6 text-white/85" dir={testLocale === "ar" ? "rtl" : "ltr"}>{result.message}</p>
        </div>
      )}
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
