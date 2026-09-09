import { LifeBuoy } from "lucide-react";

export function ChatSupportCard({ isArabic, onRequestHandoff }: { isArabic: boolean; onRequestHandoff: () => void }) {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return (
    <div className="rounded-xl border border-white/10 bg-[#101416] p-4">
      <div className="flex items-center gap-2 text-[#22d3ee]"><LifeBuoy size={15} /><span className="text-sm font-semibold text-white/90">{isArabic ? "دعم CELIBERY" : "CELIBERY Support"}</span></div>
      <p className="mt-2 text-[11px] text-white/50">
        {isArabic ? "يمكنني توصيلك بفريق الدعم البشري." : "I can connect you with our human support team."}
        {supportEmail ? ` ${supportEmail}` : ""}
      </p>
      <button
        type="button"
        onClick={onRequestHandoff}
        className="mt-3 w-full rounded-lg bg-[#22d3ee] py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#080a0c] transition hover:bg-white"
      >
        {isArabic ? "تواصل مع الدعم" : "Connect with Support"}
      </button>
    </div>
  );
}
