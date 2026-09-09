"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { upsertAdminBlogPostAction, type AdminBlogPost } from "@/actions/blog";

const emptyTranslation = { title: "", excerpt: "", content: "", seoTitle: "", seoDescription: "" };

function blankPost(): AdminBlogPost {
  return { id: "", slug: "", status: "draft", featuredImage: "/lifestyle/travel.jpg", updatedAt: "", en: { ...emptyTranslation }, ar: { ...emptyTranslation } };
}

export function BlogForm({ initial }: { initial?: AdminBlogPost }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [post, setPost] = useState<AdminBlogPost>(initial ?? blankPost());
  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isNew = !initial;

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await upsertAdminBlogPostAction(post);
      if (result.error) { setError(result.error); return; }
      router.push("/admin/blog");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/blog" className="mb-3 inline-flex items-center gap-2 text-[11px] text-white/50 transition hover:text-white"><ArrowLeft size={13} /> {isArabic ? "المجلة" : "Journal"}</Link>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">{isNew ? (isArabic ? "مقال جديد" : "New post") : (isArabic ? "تعديل المقال" : "Edit post")}</h1>
        </div>
        <button onClick={save} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white disabled:opacity-60"><Save size={14} /> {isPending ? "..." : (isArabic ? "حفظ" : "Save")}</button>
      </div>

      {error && <p className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"><AlertCircle size={14} className="shrink-0" /> {error}</p>}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex gap-1 rounded-lg bg-white/5 p-1">
              <button onClick={() => setActiveTab("en")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${activeTab === "en" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>ENGLISH</button>
              <button onClick={() => setActiveTab("ar")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${activeTab === "ar" ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>العربية</button>
            </div>
          </div>

          {activeTab === "en" ? (
            <div className="space-y-4">
              <Field label="Title"><input value={post.en.title} onChange={(e) => setPost({ ...post, en: { ...post.en, title: e.target.value } })} className="admin-input" /></Field>
              <Field label="Excerpt"><input value={post.en.excerpt} onChange={(e) => setPost({ ...post, en: { ...post.en, excerpt: e.target.value } })} className="admin-input" /></Field>
              <Field label="Content"><textarea value={post.en.content} onChange={(e) => setPost({ ...post, en: { ...post.en, content: e.target.value } })} rows={12} className="admin-input resize-none" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="SEO Title"><input value={post.en.seoTitle} onChange={(e) => setPost({ ...post, en: { ...post.en, seoTitle: e.target.value } })} className="admin-input" /></Field>
                <Field label="SEO Description"><input value={post.en.seoDescription} onChange={(e) => setPost({ ...post, en: { ...post.en, seoDescription: e.target.value } })} className="admin-input" /></Field>
              </div>
            </div>
          ) : (
            <div className="space-y-4" dir="rtl">
              <Field label="العنوان"><input value={post.ar.title} onChange={(e) => setPost({ ...post, ar: { ...post.ar, title: e.target.value } })} className="admin-input text-right" /></Field>
              <Field label="مقتطف"><input value={post.ar.excerpt} onChange={(e) => setPost({ ...post, ar: { ...post.ar, excerpt: e.target.value } })} className="admin-input text-right" /></Field>
              <Field label="المحتوى"><textarea value={post.ar.content} onChange={(e) => setPost({ ...post, ar: { ...post.ar, content: e.target.value } })} rows={12} className="admin-input resize-none text-right" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="عنوان SEO"><input value={post.ar.seoTitle} onChange={(e) => setPost({ ...post, ar: { ...post.ar, seoTitle: e.target.value } })} className="admin-input text-right" /></Field>
                <Field label="وصف SEO"><input value={post.ar.seoDescription} onChange={(e) => setPost({ ...post, ar: { ...post.ar, seoDescription: e.target.value } })} className="admin-input text-right" /></Field>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-[#101416] p-5 space-y-4">
            <Field label={isArabic ? "الرابط" : "Slug"}><input value={post.slug} onChange={(e) => setPost({ ...post, slug: e.target.value })} className="admin-input font-mono" placeholder="auto-generated" /></Field>
            <Field label={isArabic ? "صورة الغلاف" : "Featured image"}><input value={post.featuredImage} onChange={(e) => setPost({ ...post, featuredImage: e.target.value })} className="admin-input" /></Field>
            <Field label={isArabic ? "الحالة" : "Status"}>
              <select value={post.status} onChange={(e) => setPost({ ...post, status: e.target.value as AdminBlogPost["status"] })} className="admin-input">
                <option value="draft">{isArabic ? "مسودة" : "Draft"}</option>
                <option value="published">{isArabic ? "منشور" : "Published"}</option>
              </select>
            </Field>
          </div>
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
