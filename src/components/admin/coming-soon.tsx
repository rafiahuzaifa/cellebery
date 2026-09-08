import { Construction } from "lucide-react";

export function AdminComingSoon({ titleEn, titleAr, noteEn, noteAr, isArabic }: { titleEn: string; titleAr: string; noteEn: string; noteAr: string; isArabic: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "قريباً" : "Coming up"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? titleAr : titleEn}</h1>
      </div>
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-white/15 bg-[#101416] px-6 py-20 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-[#22d3ee]/10 text-[#22d3ee]"><Construction size={20} strokeWidth={1.5} /></span>
        <p className="max-w-sm text-sm text-white/50">{isArabic ? noteAr : noteEn}</p>
      </div>
    </div>
  );
}
