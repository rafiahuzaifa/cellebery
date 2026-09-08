"use client";

import { useLocale } from "@/components/locale-provider";
import { AdminComingSoon } from "@/components/admin/coming-soon";

export default function AdminBlogPage() {
  const { isArabic } = useLocale();
  return (
    <AdminComingSoon
      isArabic={isArabic}
      titleEn="CELIBERY Journal"
      titleAr="مجلة سيليبري"
      noteEn="Bilingual blog posts with rich text, featured images, and draft/published states arrive once the BlogPost model is connected to a live database."
      noteAr="ستتوفر مقالات المدونة ثنائية اللغة بعد ربط قاعدة البيانات."
    />
  );
}
