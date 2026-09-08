"use client";

import { Truck } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

const zone = {
  name: "Saudi Arabia",
  nameAr: "المملكة العربية السعودية",
  regions: ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Taif"],
  regionsAr: ["الرياض", "جدة", "مكة", "المدينة", "الدمام", "الخبر", "الطائف"],
};

const methods = [
  { name: "Standard Delivery", nameAr: "توصيل عادي", price: 25, freeThreshold: 399, days: "2–5" },
  { name: "Express Delivery", nameAr: "توصيل سريع", price: 60, freeThreshold: null, days: "1–2" },
];

export default function AdminShippingPage() {
  const { isArabic } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "التوصيل" : "Fulfillment"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "الشحن" : "Shipping"}</h1>
        <p className="mt-1 text-xs text-white/40">{isArabic ? "مطابق للبيانات المُهيّأة في prisma/seed.ts." : "Matches the data seeded in prisma/seed.ts for the Saudi Arabia shipping zone."}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-[#22d3ee]/12 text-[#22d3ee]"><Truck size={14} /></span>
          <h2 className="text-sm font-semibold text-white/85">{isArabic ? zone.nameAr : zone.name}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(isArabic ? zone.regionsAr : zone.regions).map((region) => (
            <span key={region} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/60">{region}</span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101416]">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/40">
              <th className="px-4 py-3 font-medium">{isArabic ? "طريقة الشحن" : "Method"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "السعر" : "Price"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "مجاني فوق" : "Free above"}</th>
              <th className="px-4 py-3 font-medium">{isArabic ? "مدة التوصيل" : "Delivery time"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {methods.map((method) => (
              <tr key={method.name}>
                <td className="px-4 py-3 font-medium text-white/85">{isArabic ? method.nameAr : method.name}</td>
                <td className="px-4 py-3 text-white/60">SAR {method.price}</td>
                <td className="px-4 py-3 text-white/60">{method.freeThreshold ? `SAR ${method.freeThreshold}` : "—"}</td>
                <td className="px-4 py-3 text-white/60">{method.days} {isArabic ? "أيام" : "days"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
