"use client";

import { useLocale } from "@/components/locale-provider";
import { AdminComingSoon } from "@/components/admin/coming-soon";

export default function AdminCustomersPage() {
  const { isArabic } = useLocale();
  return (
    <AdminComingSoon
      isArabic={isArabic}
      titleEn="Customers"
      titleAr="العملاء"
      noteEn="Customer accounts arrive once Auth.js is wired up in the next phase — this table will list registered users, order history, and lifetime value from the database."
      noteAr="ستظهر حسابات العملاء بعد ربط نظام تسجيل الدخول Auth.js في المرحلة القادمة."
    />
  );
}
