import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const QUICK_ACTIONS: { en: string; ar: string }[] = [
  { en: "Find my perfect product", ar: "اعثر على المنتج المناسب" },
  { en: "Compare products", ar: "قارن المنتجات" },
  { en: "Best for travel", ar: "الأفضل للسفر" },
  { en: "Best for music", ar: "الأفضل للموسيقى" },
  { en: "Shipping & delivery", ar: "الشحن والتوصيل" },
  { en: "Warranty & returns", ar: "الضمان والإرجاع" },
];

export function ChatWelcome({ isArabic, onSelect, productName }: { isArabic: boolean; onSelect: (text: string) => void; productName?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl rounded-bl-sm bg-[#101416] px-4 py-3.5">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#22d3ee]/15 text-[#22d3ee]"><Sparkles size={14} /></span>
        <p className="text-sm leading-6 text-white/90">
          {productName
            ? (isArabic ? `تحتاج مساعدة بخصوص ${productName}؟ يمكنني شرح مميزاته، مقارنته بمنتج آخر، أو مساعدتك في تحديد إن كان مناسباً لك.` : `Need help with the ${productName}? I can explain its features, compare it with another CELIBERY product, or help you decide if it's right for you.`)
            : (isArabic ? "مرحباً بك في CELIBERY AI. يمكنني مساعدتك في اختيار المنتج المناسب، مقارنة المنتجات والإجابة عن أسئلتك." : "Welcome to CELIBERY AI. I can help you find the right sound, compare products, answer questions, and make shopping easier.")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.en}
            type="button"
            onClick={() => onSelect(isArabic ? action.ar : action.en)}
            className="rounded-full border border-white/15 px-3.5 py-2 text-[11px] font-medium text-white/75 transition hover:border-[#22d3ee]/60 hover:text-[#22d3ee]"
          >
            {isArabic ? action.ar : action.en}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
