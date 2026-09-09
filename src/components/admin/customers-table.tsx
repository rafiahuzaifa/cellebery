"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/locale-provider";
import type { AdminCustomer } from "@/actions/customers";

export function CustomersTable({ customers }: { customers: AdminCustomer[] }) {
  const { isArabic } = useLocale();
  const [query, setQuery] = useState("");

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "المستخدمون" : "Users"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "العملاء" : "Customers"}</h1>
        <p className="mt-1 text-xs text-white/40">{customers.length} {isArabic ? "عميل مسجّل" : "registered customers"}</p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101416] px-4 py-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isArabic ? "بحث بالاسم أو البريد" : "Search name or email"} className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30" />
        <span className="text-[11px] text-white/35">{filtered.length} {isArabic ? "نتيجة" : "results"}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{customers.length === 0 ? (isArabic ? "لا يوجد عملاء مسجّلون بعد." : "No registered customers yet.") : (isArabic ? "لا توجد نتائج." : "No results.")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101416]">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40">
                <th className="px-4 py-3 font-medium">{isArabic ? "الاسم" : "Name"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "البريد الإلكتروني" : "Email"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الجوال" : "Phone"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الطلبات" : "Orders"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "القيمة الدائمة" : "Lifetime value"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "تاريخ التسجيل" : "Joined"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white/85"><Link href={`/admin/customers/${customer.id}`} className="hover:text-[#22d3ee]">{customer.name || "—"}</Link></td>
                  <td className="px-4 py-3 text-white/60">{customer.email}</td>
                  <td className="px-4 py-3 text-white/60">{customer.phone || "—"}</td>
                  <td className="px-4 py-3 text-white/60">{customer.orderCount}</td>
                  <td className="px-4 py-3 text-white/70">SAR {customer.lifetimeValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-white/40">{new Date(customer.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
