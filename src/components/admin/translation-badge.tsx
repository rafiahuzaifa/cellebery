import { Check, CircleDashed, TriangleAlert } from "lucide-react";
import type { AdminProduct } from "@/lib/admin/catalog";
import { translationStatus } from "@/lib/admin/catalog";

const CONFIG = {
  complete: { icon: Check, label: "Complete", labelAr: "مكتملة", className: "text-emerald-300 bg-emerald-500/10" },
  partial: { icon: TriangleAlert, label: "Partial", labelAr: "غير مكتملة", className: "text-amber-300 bg-amber-500/10" },
  missing: { icon: CircleDashed, label: "Missing", labelAr: "مفقودة", className: "text-white/40 bg-white/5" },
} as const;

export function TranslationBadge({ product, isArabic }: { product: AdminProduct; isArabic: boolean }) {
  const status = translationStatus(product);
  const { icon: Icon, label, labelAr, className } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${className}`}>
      <Icon size={11} /> {isArabic ? labelAr : label}
    </span>
  );
}
