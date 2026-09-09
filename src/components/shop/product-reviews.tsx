"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Check, ShieldCheck, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { submitReviewAction, type PublicReview, type ReviewFormState } from "@/actions/reviews";

function StaticStars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={size} className={star <= rating ? "fill-[#22d3ee] text-[#22d3ee]" : "text-white/20"} />)}
    </span>
  );
}

export function ProductReviews({ reviews, slug, locale, isArabic }: { reviews: PublicReview[]; slug: string; locale: string; isArabic: boolean }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(submitReviewAction, undefined);

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <section className="border-t border-white/10 px-6 py-16 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "آراء العملاء" : "Customer Reviews"}</p>
            <div className="flex items-center gap-3">
              {reviews.length > 0 && <StaticStars rating={Math.round(avgRating)} size={16} />}
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">{reviews.length > 0 ? `${avgRating.toFixed(1)} (${reviews.length})` : (isArabic ? "لا توجد تقييمات بعد" : "No reviews yet")}</h2>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-sm text-white/40">{isArabic ? "كن أول من يقيّم هذا المنتج." : "Be the first to review this product."}</p>
            ) : reviews.map((review) => (
              <div key={review.id} className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                  <StaticStars rating={review.rating} />
                  {review.verifiedPurchase && <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-emerald-300"><ShieldCheck size={12} /> {isArabic ? "شراء موثق" : "Verified purchase"}</span>}
                </div>
                {review.title && <p className="mt-2 text-sm font-semibold text-white/90">{review.title}</p>}
                <p className="mt-1.5 text-sm leading-6 text-white/60">{review.comment}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-white/35">{review.authorName} · {new Date(review.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</p>
              </div>
            ))}
          </div>

          <div className="h-fit border border-white/10 bg-[#101416] p-6">
            <h3 className="mb-4 text-sm font-semibold text-white/85">{isArabic ? "اكتب تقييماً" : "Write a review"}</h3>
            {!session?.user ? (
              <p className="text-xs text-white/45">{isArabic ? "يرجى تسجيل الدخول لكتابة تقييم." : "Please sign in to write a review."} <a href={`/${locale}/account/login`} className="text-[#22d3ee] hover:text-white">{isArabic ? "تسجيل الدخول" : "Sign in"}</a></p>
            ) : state?.success ? (
              <p className="flex items-center gap-2 text-xs text-emerald-300"><Check size={14} /> {isArabic ? "شكراً! سيظهر تقييمك بعد المراجعة." : "Thank you! Your review will appear after moderation."}</p>
            ) : (
              <form action={formAction} className="space-y-3">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="rating" value={rating} />
                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onClick={() => setRating(star)} aria-label={`${star} stars`}>
                      <Star size={22} className={star <= (hoverRating || rating) ? "fill-[#22d3ee] text-[#22d3ee]" : "text-white/20"} />
                    </button>
                  ))}
                </div>
                <input name="title" placeholder={isArabic ? "عنوان (اختياري)" : "Title (optional)"} className="w-full border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[#22d3ee]" />
                <textarea name="comment" required minLength={10} rows={4} placeholder={isArabic ? "شاركنا رأيك..." : "Share your thoughts..."} className="w-full resize-none border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[#22d3ee]" />
                {state?.error && <p className="flex items-center gap-2 text-xs text-red-300"><AlertCircle size={13} className="shrink-0" /> {state.error}</p>}
                <button type="submit" disabled={pending || rating === 0} className="w-full bg-[#22d3ee] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#080a0c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">
                  {pending ? (isArabic ? "جارٍ الإرسال..." : "Submitting...") : (isArabic ? "إرسال التقييم" : "Submit review")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
