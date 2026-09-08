"use client";

import { useLocale } from "@/components/locale-provider";
import { AdminComingSoon } from "@/components/admin/coming-soon";

export default function AdminCouponsPage() {
  const { isArabic } = useLocale();
  return (
    <AdminComingSoon
      isArabic={isArabic}
      titleEn="Coupons"
      titleAr="القسائم"
      noteEn="The Coupon model (percentage/fixed, minimum order, usage limits, expiry) is already in the schema — this UI arrives once it's wired to a live database."
      noteAr="نموذج القسائم موجود بالفعل في قاعدة البيانات — ستتوفر هذه الواجهة عند ربطها بقاعدة بيانات فعلية."
    />
  );
}
