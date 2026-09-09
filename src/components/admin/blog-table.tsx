"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { deleteAdminBlogPostAction, type AdminBlogPost } from "@/actions/blog";

export function BlogTable({ posts }: { posts: AdminBlogPost[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const filtered = posts.filter((p) => p.en.title.toLowerCase().includes(query.toLowerCase()));

  const remove = (id: string) => {
    if (!confirm(isArabic ? "حذف هذا المقال؟" : "Delete this post?")) return;
    startTransition(async () => { await deleteAdminBlogPostAction(id); router.refresh(); });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "المحتوى" : "Content"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "مجلة CELIBERY" : "CELIBERY Journal"}</h1>
        </div>
        <Link href="/admin/blog/new" className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white">
          <Plus size={14} /> {isArabic ? "مقال جديد" : "New post"}
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101416] px-4 py-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isArabic ? "بحث بالعنوان" : "Search title"} className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30" />
        <span className="text-[11px] text-white/35">{filtered.length} {isArabic ? "مقال" : "posts"}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center"><p className="text-sm text-white/50">{isArabic ? "لا توجد مقالات بعد." : "No posts yet."}</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101416]">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40">
                <th className="px-4 py-3 font-medium">{isArabic ? "العنوان" : "Title"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "آخر تحديث" : "Updated"}</th>
                <th className="px-4 py-3 font-medium text-end">{isArabic ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-3 font-medium text-white/85">{post.en.title || "(untitled)"}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${post.status === "published" ? "text-emerald-300 bg-emerald-500/10" : "text-white/50 bg-white/5"}`}>{post.status}</span></td>
                  <td className="px-4 py-3 text-white/40">{post.updatedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/blog/${post.id}`} aria-label="Edit" className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"><Pencil size={14} /></Link>
                      <button aria-label="Delete" disabled={isPending} onClick={() => remove(post.id)} className="grid size-8 place-items-center rounded-lg text-white/50 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
