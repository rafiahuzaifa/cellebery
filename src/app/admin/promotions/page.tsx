"use client";

import { useLocale } from "@/components/locale-provider";
import { AdminComingSoon } from "@/components/admin/coming-soon";

export default function AdminPromotionsPage() {
  const { isArabic } = useLocale();
  return (
    <AdminComingSoon
      isArabic={isArabic}
      titleEn="Promotions"
      titleAr="العروض"
      noteEn="Schedule product and category promotions here once the Promotion model is connected to a live database."
      noteAr="ستتمكن من جدولة العروض للمنتجات والفئات هنا بعد ربط قاعدة البيانات."
    />
  );
}
