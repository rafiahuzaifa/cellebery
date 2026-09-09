"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ShieldCheck, Star, Trash2, X } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { setReviewStatusAction, deleteReviewAction, type AdminReview } from "@/actions/reviews";

const STATUS_TONE: Record<string, string> = {
  PENDING: "text-amber-300 bg-amber-500/10",
  APPROVED: "text-emerald-300 bg-emerald-500/10",
  REJECTED: "text-red-300 bg-red-500/10",
};

const TABS = ["PENDING", "APPROVED", "REJECTED", "ALL"] as const;

export function ReviewsTable({ reviews }: { reviews: AdminReview[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<(typeof TABS)[number]>("PENDING");

  const filtered = tab === "ALL" ? reviews : reviews.filter((r) => r.status === tab);
  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;

  const runAction = (action: () => Promise<unknown>) => startTransition(async () => { await action(); router.refresh(); });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "المحتوى" : "Content"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "التقييمات" : "Reviews"}</h1>
        <p className="mt-1 text-xs text-white/40">{pendingCount > 0 ? `${pendingCount} ${isArabic ? "بانتظار المراجعة" : "awaiting moderation"}` : (isArabic ? "لا توجد تقييمات معلقة" : "Nothing pending")}</p>
      </div>

      <div className="flex gap-1 rounded-lg bg-white/5 p-1 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tab === t ? "bg-[#22d3ee] text-[#080a0c]" : "text-white/55"}`}>
            {t === "ALL" ? (isArabic ? "الكل" : "All") : t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لا توجد تقييمات." : "No reviews here."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div key={review.id} className="rounded-xl border border-white/10 bg-[#101416] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={13} className={s <= review.rating ? "fill-[#22d3ee] text-[#22d3ee]" : "text-white/20"} />)}</span>
                    {review.verifiedPurchase && <span className="flex items-center gap-1 text-[10px] uppercase text-emerald-300"><ShieldCheck size={11} /> {isArabic ? "شراء موثق" : "Verified"}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_TONE[review.status]}`}>{review.status}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-white/40">{review.productName} · {review.customerName} ({review.customerEmail}) · {new Date(review.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</p>
                </div>
                <div className="flex gap-1.5">
                  {review.status !== "APPROVED" && <button disabled={isPending} onClick={() => runAction(() => setReviewStatusAction(review.id, "APPROVED"))} className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-500/20"><Check size={12} /> {isArabic ? "قبول" : "Approve"}</button>}
                  {review.status !== "REJECTED" && <button disabled={isPending} onClick={() => runAction(() => setReviewStatusAction(review.id, "REJECTED"))} className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold text-red-300 transition hover:bg-red-500/20"><X size={12} /> {isArabic ? "رفض" : "Reject"}</button>}
                  <button disabled={isPending} onClick={() => { if (confirm(isArabic ? "حذف هذا التقييم؟" : "Delete this review?")) runAction(() => deleteReviewAction(review.id)); }} className="grid size-7 place-items-center rounded-md text-white/40 transition hover:bg-white/5 hover:text-red-300"><Trash2 size={13} /></button>
                </div>
              </div>
              {review.title && <p className="mt-3 text-sm font-semibold text-white/85">{review.title}</p>}
              <p className="mt-1 text-sm leading-6 text-white/60">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
