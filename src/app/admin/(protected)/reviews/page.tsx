"use client";

import { useLocale } from "@/components/locale-provider";
import { AdminComingSoon } from "@/components/admin/coming-soon";

export default function AdminReviewsPage() {
  const { isArabic } = useLocale();
  return (
    <AdminComingSoon
      isArabic={isArabic}
      titleEn="Reviews"
      titleAr="التقييمات"
      noteEn="Review moderation (approve, reject, and respond to bilingual customer reviews) will populate here once the Review model is connected to a live database."
      noteAr="ستتوفر إدارة التقييمات بعد ربط نموذج المراجعات بقاعدة بيانات فعلية."
    />
  );
}
