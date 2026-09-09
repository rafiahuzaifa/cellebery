"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useLocale } from "@/components/locale-provider";
import type { PublicBlogPost } from "@/actions/blog";

export function BlogList({ posts }: { posts: PublicBlogPost[] }) {
  const { isArabic, locale } = useLocale();

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>
      <section className="mx-auto max-w-[1440px] px-6 pb-16 pt-20 lg:px-12 lg:pt-28">
        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "المجلة" : "Journal"}</p>
        <h1 className="display-font text-6xl font-semibold uppercase leading-[0.88] sm:text-8xl">{isArabic ? "مجلة CELIBERY" : "CELIBERY Journal"}</h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-white/50">{isArabic ? "قصص عن الصوت والتصميم والحرفية." : "Stories on sound, design, and craft."}</p>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-12">
        {posts.length === 0 ? (
          <div className="border border-white/10 bg-[#101416] px-6 py-24 text-center"><p className="text-sm text-white/50">{isArabic ? "لا توجد مقالات بعد." : "No articles yet."}</p></div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#151a1c]">
                  <div className="absolute inset-0 bg-cover bg-center opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" style={{ backgroundImage: post.featuredImage ? `url(${post.featuredImage})` : undefined }} />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-white/35">{new Date(post.publishedAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] transition group-hover:text-[#22d3ee]">{post.title}</h2>
                {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{post.excerpt}</p>}
                <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#22d3ee]">{isArabic ? "اقرأ المزيد" : "Read more"} <ArrowUpRight size={13} /></span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
