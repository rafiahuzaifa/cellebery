"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useLocale } from "@/components/locale-provider";
import type { PublicBlogPost } from "@/actions/blog";

export function BlogPostDetail({ post }: { post: PublicBlogPost | null }) {
  const { isArabic, locale } = useLocale();

  if (!post) {
    return (
      <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
        <header className="border-b border-white/10"><SiteNav /></header>
        <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لم يتم العثور على المقال." : "Article not found."}</p>
          <Link href={`/${locale}/blog`} className="mt-7 text-xs font-semibold text-[#22d3ee]">{isArabic ? "العودة إلى المجلة" : "Back to the journal"}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>
      <article className="mx-auto max-w-3xl px-6 py-16 lg:px-0 lg:py-24">
        <Link href={`/${locale}/blog`} className="mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/50 transition hover:text-white"><ArrowLeft size={13} /> {isArabic ? "المجلة" : "Journal"}</Link>
        <p className="mb-4 text-[10px] uppercase tracking-[0.12em] text-white/35">{new Date(post.publishedAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</p>
        <h1 className="display-font text-4xl font-semibold uppercase leading-[0.95] sm:text-6xl">{post.title}</h1>
        {post.featuredImage && <div className="mt-8 aspect-[16/9] bg-cover bg-center" style={{ backgroundImage: `url(${post.featuredImage})` }} />}
        <div className="mt-10 whitespace-pre-line text-base leading-8 text-white/70">{post.content}</div>
      </article>
    </main>
  );
}
