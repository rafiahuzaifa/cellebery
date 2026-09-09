"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { upsertCustomerAddressAction, deleteCustomerAddressAction, type CustomerAddress } from "@/actions/account";

function blankAddress(): CustomerAddress {
  return { id: "", label: "", recipientName: "", phone: "", region: "", city: "", street: "", isDefault: false };
}

export function AccountAddresses({ addresses }: { addresses: CustomerAddress[] }) {
  const { isArabic } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const result = await upsertCustomerAddressAction(editing);
      if (result.error) { setError(result.error); return; }
      setEditing(null);
      router.refresh();
    });
  };

  const remove = (id: string) => {
    if (!confirm(isArabic ? "حذف هذا العنوان؟" : "Delete this address?")) return;
    startTransition(async () => {
      await deleteCustomerAddressAction(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "حسابي" : "My Account"}</p>
          <h1 className="display-font mt-2 text-4xl font-semibold uppercase leading-[0.9]">{isArabic ? "العناوين" : "Addresses"}</h1>
        </div>
        <button onClick={() => { setEditing(blankAddress()); setError(null); }} className="flex items-center gap-2 bg-[#22d3ee] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#080a0c] transition hover:bg-white">
          <Plus size={13} /> {isArabic ? "عنوان جديد" : "New address"}
        </button>
      </div>

      {addresses.length === 0 && !editing && (
        <div className="border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لا توجد عناوين محفوظة." : "No saved addresses yet."}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="border border-white/10 bg-[#101416] p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#22d3ee]"><MapPin size={14} /> <span className="text-xs font-semibold text-white/85">{address.label || (isArabic ? "عنوان" : "Address")}</span></div>
              {address.isDefault && <span className="rounded-full bg-[#22d3ee]/10 px-2 py-1 text-[9px] font-bold uppercase text-[#22d3ee]">{isArabic ? "افتراضي" : "Default"}</span>}
            </div>
            <p className="mt-3 text-xs leading-6 text-white/60">{address.recipientName}<br />{address.phone}<br />{address.street}, {address.city}, {address.region}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setEditing(address); setError(null); }} className="flex-1 border border-white/15 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/70 transition hover:border-white/40">{isArabic ? "تعديل" : "Edit"}</button>
              <button onClick={() => remove(address.id)} disabled={isPending} className="grid size-9 shrink-0 place-items-center border border-white/15 text-white/50 transition hover:border-red-400/40 hover:text-red-300"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="max-w-lg border border-white/10 bg-[#101416] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/85">{editing.id ? (isArabic ? "تعديل العنوان" : "Edit address") : (isArabic ? "عنوان جديد" : "New address")}</h2>
          {error && <p className="mb-4 flex items-center gap-2 border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300"><AlertCircle size={13} /> {error}</p>}
          <div className="space-y-3">
            <Field label={isArabic ? "التسمية (اختياري)" : "Label (optional)"}><input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} className="admin-input" placeholder={isArabic ? "المنزل، العمل..." : "Home, Work..."} /></Field>
            <Field label={isArabic ? "اسم المستلم" : "Recipient name"}><input value={editing.recipientName} onChange={(e) => setEditing({ ...editing, recipientName: e.target.value })} className="admin-input" /></Field>
            <Field label={isArabic ? "رقم الجوال" : "Phone"}><input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="admin-input" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={isArabic ? "المدينة" : "City"}><input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} className="admin-input" /></Field>
              <Field label={isArabic ? "المنطقة" : "Region"}><input value={editing.region} onChange={(e) => setEditing({ ...editing, region: e.target.value })} className="admin-input" /></Field>
            </div>
            <Field label={isArabic ? "الشارع" : "Street address"}><input value={editing.street} onChange={(e) => setEditing({ ...editing, street: e.target.value })} className="admin-input" /></Field>
            <label className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} /> {isArabic ? "اجعله العنوان الافتراضي" : "Set as default address"}</label>
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={save} disabled={isPending} className="flex items-center gap-2 bg-[#22d3ee] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#080a0c] transition hover:bg-white disabled:opacity-60"><Save size={13} /> {isPending ? "..." : (isArabic ? "حفظ" : "Save")}</button>
            <button onClick={() => setEditing(null)} className="border border-white/15 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60">{isArabic ? "إلغاء" : "Cancel"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{label}</span>
      {children}
    </label>
  );
}
