"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, Plus, Save, Trash2, Truck } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import {
  upsertShippingZoneAction,
  deleteShippingZoneAction,
  upsertShippingMethodAction,
  deleteShippingMethodAction,
  type AdminShippingZone,
  type AdminShippingMethod,
} from "@/actions/shipping";

function blankZone(): AdminShippingZone {
  return { id: "", name: "", regions: [], active: true, methods: [] };
}
function blankMethod(zoneId: string): AdminShippingMethod {
  return { id: "", zoneId, name: "", nameAr: "", price: 0, freeThreshold: null, minDays: 1, maxDays: 3, active: true };
}

export function ShippingManager({ zones }: { zones: AdminShippingZone[] }) {
  const { isArabic } = useLocale();
  const [addingZone, setAddingZone] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "التوصيل" : "Fulfillment"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{isArabic ? "الشحن" : "Shipping"}</h1>
          <p className="mt-1 text-xs text-white/40">{isArabic ? "مناطق وطرق الشحن الفعلية المستخدمة عند الدفع." : "The real shipping zones and methods used at checkout."}</p>
        </div>
        <button onClick={() => setAddingZone(true)} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-semibold text-[#080a0c] transition hover:bg-white">
          <Plus size={14} /> {isArabic ? "منطقة جديدة" : "New zone"}
        </button>
      </div>

      {zones.length === 0 && !addingZone && (
        <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
          <p className="text-sm text-white/50">{isArabic ? "لا توجد مناطق شحن بعد." : "No shipping zones yet."}</p>
        </div>
      )}

      {addingZone && <ZoneCard zone={blankZone()} isArabic={isArabic} onDoneCreating={() => setAddingZone(false)} />}

      {zones.map((zone) => <ZoneCard key={zone.id} zone={zone} isArabic={isArabic} />)}
    </div>
  );
}

function ZoneCard({ zone, isArabic, onDoneCreating }: { zone: AdminShippingZone; isArabic: boolean; onDoneCreating?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(zone.name);
  const [regionsText, setRegionsText] = useState(zone.regions.join(", "));
  const [active, setActive] = useState(zone.active);
  const [error, setError] = useState<string | null>(null);
  const [addingMethod, setAddingMethod] = useState(false);
  const isNew = !zone.id;

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await upsertShippingZoneAction({ id: zone.id, name, regions: regionsText.split(",").map((r) => r.trim()).filter(Boolean), active });
      if (result.error) { setError(result.error); return; }
      if (isNew) onDoneCreating?.();
      router.refresh();
    });
  };

  const remove = () => {
    if (!confirm(isArabic ? "حذف هذه المنطقة وكل طرق الشحن فيها؟" : "Delete this zone and all its shipping methods?")) return;
    startTransition(async () => { await deleteShippingZoneAction(zone.id); router.refresh(); });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#101416] p-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[180px] flex-1">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "اسم المنطقة" : "Zone name"}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="admin-input" placeholder="Saudi Arabia" />
        </label>
        <label className="min-w-[240px] flex-[2]">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "المناطق (مفصولة بفواصل)" : "Regions (comma-separated)"}</span>
          <input value={regionsText} onChange={(e) => setRegionsText(e.target.value)} className="admin-input" placeholder="Riyadh, Jeddah, Dammam" />
        </label>
        <label className="flex items-center gap-2 pb-2.5 text-xs text-white/60"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> {isArabic ? "نشطة" : "Active"}</label>
        <button onClick={save} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#080a0c] transition hover:bg-white disabled:opacity-60"><Save size={13} /> {isPending ? "..." : (isArabic ? "حفظ" : "Save")}</button>
        {!isNew && <button onClick={remove} disabled={isPending} className="grid size-9 place-items-center rounded-lg text-white/40 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 size={14} /></button>}
        {isNew && <button onClick={onDoneCreating} className="rounded-lg border border-white/15 px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/60">{isArabic ? "إلغاء" : "Cancel"}</button>}
      </div>
      {error && <p className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300"><AlertCircle size={13} /> {error}</p>}

      {!isNew && (
        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-white/70"><Truck size={13} className="text-[#22d3ee]" /> {isArabic ? "طرق الشحن" : "Shipping methods"}</h3>
            <button onClick={() => setAddingMethod(true)} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#22d3ee]"><Plus size={12} /> {isArabic ? "طريقة جديدة" : "Add method"}</button>
          </div>
          {zone.methods.length === 0 && !addingMethod && <p className="py-4 text-center text-xs text-white/35">{isArabic ? "لا توجد طرق شحن." : "No shipping methods."}</p>}
          {addingMethod && <MethodRow method={blankMethod(zone.id)} isArabic={isArabic} onDoneCreating={() => setAddingMethod(false)} />}
          {zone.methods.map((method) => <MethodRow key={method.id} method={method} isArabic={isArabic} />)}
        </div>
      )}
    </div>
  );
}

function MethodRow({ method, isArabic, onDoneCreating }: { method: AdminShippingMethod; isArabic: boolean; onDoneCreating?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState(method);
  const [error, setError] = useState<string | null>(null);
  const isNew = !method.id;

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await upsertShippingMethodAction(draft);
      if (result.error) { setError(result.error); return; }
      if (isNew) onDoneCreating?.();
      router.refresh();
    });
  };

  const remove = () => {
    if (!confirm(isArabic ? "حذف طريقة الشحن هذه؟" : "Delete this shipping method?")) return;
    startTransition(async () => { await deleteShippingMethodAction(method.id); router.refresh(); });
  };

  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0d0f] p-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="admin-input" placeholder="Standard" />
        <input value={draft.nameAr} onChange={(e) => setDraft({ ...draft, nameAr: e.target.value })} className="admin-input" placeholder="عادي" dir="rtl" />
        <input type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} className="admin-input" placeholder={isArabic ? "السعر" : "Price"} />
        <input type="number" value={draft.freeThreshold ?? ""} onChange={(e) => setDraft({ ...draft, freeThreshold: e.target.value ? Number(e.target.value) : null })} className="admin-input" placeholder={isArabic ? "حد مجاني" : "Free over"} />
        <input type="number" value={draft.minDays} onChange={(e) => setDraft({ ...draft, minDays: Number(e.target.value) })} className="admin-input" placeholder={isArabic ? "أقل أيام" : "Min days"} />
        <input type="number" value={draft.maxDays} onChange={(e) => setDraft({ ...draft, maxDays: Number(e.target.value) })} className="admin-input" placeholder={isArabic ? "أقصى أيام" : "Max days"} />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] text-white/60"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> {isArabic ? "نشطة" : "Active"}</label>
        </div>
      </div>
      {error && <p className="mt-2 flex items-center gap-2 text-[11px] text-red-300"><AlertCircle size={12} /> {error}</p>}
      <div className="mt-2.5 flex gap-2">
        <button onClick={save} disabled={isPending} className="flex items-center gap-1.5 rounded-md bg-[#22d3ee] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#080a0c] transition hover:bg-white disabled:opacity-60"><Save size={11} /> {isPending ? "..." : (isArabic ? "حفظ" : "Save")}</button>
        {!isNew && <button onClick={remove} disabled={isPending} className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50 transition hover:border-red-400/40 hover:text-red-300"><Trash2 size={11} /> {isArabic ? "حذف" : "Delete"}</button>}
        {isNew && <button onClick={onDoneCreating} className="rounded-md border border-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/60">{isArabic ? "إلغاء" : "Cancel"}</button>}
      </div>
    </div>
  );
}
