import { Minus, Trash2, X } from "lucide-react";

export function ChatHeader({
  isArabic,
  onToggleLocale,
  onMinimize,
  onClear,
  onClose,
}: {
  isArabic: boolean;
  onToggleLocale: () => void;
  onMinimize: () => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0d1113] px-4 py-3.5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-[-0.01em] text-white">CELIBERY AI</span>
          <span className="flex items-center gap-1 text-[10px] text-[#22d3ee]"><span className="size-1.5 rounded-full bg-[#22d3ee]" />{isArabic ? "متصل" : "Online"}</span>
        </div>
        <p className="truncate text-[11px] text-white/45">{isArabic ? "مساعدك الشخصي من CELIBERY" : "Your personal CELIBERY shopping assistant"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={onToggleLocale} className="rounded-md px-2 py-1 text-[10px] font-semibold text-white/50 transition hover:text-white" aria-label="Toggle language">
          {isArabic ? "EN" : "AR"}
        </button>
        <button type="button" onClick={onClear} aria-label={isArabic ? "مسح المحادثة" : "Clear conversation"} className="grid size-7 place-items-center rounded-md text-white/45 transition hover:bg-white/5 hover:text-white">
          <Trash2 size={14} />
        </button>
        <button type="button" onClick={onMinimize} aria-label={isArabic ? "تصغير" : "Minimize"} className="grid size-7 place-items-center rounded-md text-white/45 transition hover:bg-white/5 hover:text-white">
          <Minus size={14} />
        </button>
        <button type="button" onClick={onClose} aria-label={isArabic ? "إغلاق" : "Close"} className="grid size-7 place-items-center rounded-md text-white/45 transition hover:bg-white/5 hover:text-white">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
