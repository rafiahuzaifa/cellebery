"use client";

import { useState } from "react";
import { AlertCircle, ArrowLeft, ArrowUpRight, Check, ChevronDown, CreditCard, LockKeyhole, Minus, Plus, ShieldCheck, Smartphone, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { useCart } from "@/components/cart-provider";
import { useLocale } from "@/components/locale-provider";

type CheckoutConfirmation = {
  orderNumber: string;
  subtotal: number;
  shipping: number;
  vat: number;
  discount: number;
  total: number;
  payment: { status: string; checkoutUrl?: string };
};

const SAUDI_CITIES = ["Riyadh", "Jeddah", "Dammam", "Khobar", "Makkah", "Madinah", "Taif"];

export default function CartPage() {
  const { isArabic, locale } = useLocale();
  const { items, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<CheckoutConfirmation | null>(null);
  const orderPlaced = confirmation !== null;

  const canSubmit = items.length > 0 && fullName.trim().length > 1 && /.+@.+\..+/.test(email) && phone.trim().length >= 8 && address.trim().length > 0 && city.length > 0;

  const submitOrder = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          customer: { name: fullName, email, phone },
          address: { region: city, city, street: address },
          paymentMethod,
          couponCode: promoApplied ? promo : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? (isArabic ? "تعذر إتمام الطلب. حاول مرة أخرى." : "Could not complete the order. Please try again."));
      }
      setConfirmation(data as CheckoutConfirmation);
      clearCart();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : (isArabic ? "حدث خطأ غير متوقع." : "Something went wrong."));
    } finally {
      setSubmitting(false);
    }
  };
  const labels = isArabic ? {
    eyebrow: "السلة / الدفع",
    title: "أكمل طلبك.",
    bag: "سلة التسوق",
    item: "منتج",
    items: "منتجات",
    empty: "سلتك فارغة حالياً.",
    explore: "استكشف المجموعة",
    summary: "ملخص الطلب",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    free: "مجاني",
    vat: "ضريبة القيمة المضافة",
    total: "الإجمالي",
    delivery: "بيانات التوصيل",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الجوال",
    address: "العنوان",
    city: "المدينة",
    payment: "طريقة الدفع",
    card: "بطاقة بنكية",
    apple: "Apple Pay",
    cod: "الدفع عند الاستلام",
    cardNumber: "رقم البطاقة",
    expiry: "تاريخ الانتهاء",
    cvc: "CVC",
    pay: "تأكيد ودفع الطلب",
    secure: "دفع آمن ومشفر",
    promo: "رمز الخصم",
    apply: "تطبيق",
    applied: "تم التطبيق",
    confirmed: "تم تأكيد طلبك",
    orderMessage: "شكراً لك. سنرسل تفاصيل التوصيل إلى بريدك الإلكتروني.",
    continue: "متابعة التسوق",
  } : {
    eyebrow: "Bag / checkout",
    title: "Finish your order.",
    bag: "Shopping bag",
    item: "item",
    items: "items",
    empty: "Your bag is empty for now.",
    explore: "Explore the collection",
    summary: "Order summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    vat: "VAT",
    total: "Total",
    delivery: "Delivery details",
    name: "Full name",
    email: "Email address",
    phone: "Mobile number",
    address: "Address",
    city: "City",
    payment: "Payment method",
    card: "Bank card",
    apple: "Apple Pay",
    cod: "Cash on delivery",
    cardNumber: "Card number",
    expiry: "Expiry date",
    cvc: "CVC",
    pay: "Confirm and pay",
    secure: "Secure encrypted checkout",
    promo: "Discount code",
    apply: "Apply",
    applied: "Applied",
    confirmed: "Your order is confirmed",
    orderMessage: "Thank you. Delivery details will be sent to your email.",
    continue: "Continue shopping",
  };

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal >= 399 || subtotal === 0 ? 0 : 25;
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const vat = Math.round((subtotal - discount) * 0.15);
  const total = subtotal + shipping + vat - discount;

  if (orderPlaced && confirmation) return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]"><header className="border-b border-white/10"><SiteNav /></header><section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center"><div className="grid size-16 place-items-center rounded-full bg-[#22d3ee] text-[#080a0c]"><Check size={28} /></div><p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#22d3ee]">{confirmation.orderNumber}</p><h1 className="display-font mt-5 text-6xl font-semibold uppercase leading-[0.88] sm:text-8xl">{labels.confirmed}</h1><p className="mt-7 max-w-md text-sm leading-7 text-white/50">{labels.orderMessage}</p><p className="mt-4 text-lg text-white/80">SAR {confirmation.total}</p><Link href={`/${locale}/shop`} className="mt-9 inline-flex items-center gap-6 bg-[#22d3ee] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#080a0c]">{labels.continue}<ArrowUpRight size={15} /></Link></section></main>
  );

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>
      <section className="mx-auto max-w-[1440px] px-6 pb-12 pt-16 lg:px-12 lg:pb-16 lg:pt-24">
        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#22d3ee]">{labels.eyebrow}</p>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><h1 className="display-font text-6xl font-semibold uppercase leading-[0.88] sm:text-8xl">{labels.title}</h1><p className="mt-5 text-xs uppercase tracking-[0.16em] text-white/40">{itemCount} {itemCount === 1 ? labels.item : labels.items}</p></div><Link href={`/${locale}/shop`} className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.17em] text-white/60 transition hover:text-[#22d3ee]"><ArrowLeft size={15} /> {labels.continue}</Link></div>
      </section>

      {items.length === 0 ? <section className="mx-auto max-w-[1440px] px-6 pb-32 lg:px-12"><div className="border border-white/10 bg-[#101416] px-6 py-24 text-center"><p className="text-sm text-white/50">{labels.empty}</p><Link href={`/${locale}/shop`} className="mt-7 inline-flex items-center gap-5 bg-[#22d3ee] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#080a0c]">{labels.explore}<ArrowUpRight size={15} /></Link></div></section> : <section className="border-y border-white/10 bg-[#0d1113] px-6 py-10 lg:px-12 lg:py-16"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1fr_390px] lg:gap-16">
        <div>
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/40"><span>{labels.bag}</span><button onClick={clearCart} className="text-[#22d3ee] transition hover:text-white">Clear all</button></div>
          <div className="divide-y divide-white/10">{items.map((item) => <article key={item.id} className="flex gap-4 py-6 sm:gap-6"><div className="size-24 shrink-0 bg-[#171d1e] bg-cover bg-center sm:size-32" style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }} /><div className="flex min-w-0 flex-1 flex-col justify-between gap-5"><div className="flex justify-between gap-4"><div><h2 className="text-lg font-semibold">{item.name}</h2><p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/40">CELIBERY / Audio</p></div><span className="text-sm text-white/75">SAR {item.price * item.quantity}</span></div><div className="flex items-center justify-between"><div className="flex items-center border border-white/15"><button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid size-9 place-items-center text-white/60 transition hover:text-[#22d3ee]"><Minus size={13} /></button><span className="w-8 text-center text-xs">{item.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="grid size-9 place-items-center text-white/60 transition hover:text-[#22d3ee]"><Plus size={13} /></button></div><button aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-white/35 transition hover:text-red-300"><Trash2 size={13} /> Remove</button></div></div></article>)}</div>
          <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3"><div className="flex gap-3 text-[10px] uppercase leading-4 tracking-[0.1em] text-white/50"><Truck size={16} className="shrink-0 text-[#22d3ee]" /> Fast Saudi delivery</div><div className="flex gap-3 text-[10px] uppercase leading-4 tracking-[0.1em] text-white/50"><ShieldCheck size={16} className="shrink-0 text-[#22d3ee]" /> Two-year warranty</div><div className="flex gap-3 text-[10px] uppercase leading-4 tracking-[0.1em] text-white/50"><LockKeyhole size={16} className="shrink-0 text-[#22d3ee]" /> Protected checkout</div></div>
        </div>

        <div className="h-fit border border-white/10 bg-[#101416] p-5 sm:p-7 lg:sticky lg:top-8"><h2 className="text-lg font-semibold">{labels.summary}</h2><div className="mt-6 flex gap-2"><input value={promo} onChange={(event) => setPromo(event.target.value)} placeholder={labels.promo} className="min-w-0 flex-1 border border-white/15 bg-transparent px-3 py-3 text-xs outline-none placeholder:text-white/30 focus:border-[#22d3ee]" /><button onClick={() => setPromoApplied(Boolean(promo.trim()))} className="border border-white/15 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#22d3ee]">{promoApplied ? labels.applied : labels.apply}</button></div><div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs text-white/55"><div className="flex justify-between"><span>{labels.subtotal}</span><span>SAR {subtotal}</span></div><div className="flex justify-between"><span>{labels.shipping}</span><span>{shipping === 0 ? labels.free : `SAR ${shipping}`}</span></div>{discount > 0 && <div className="flex justify-between text-[#22d3ee]"><span>Discount</span><span>- SAR {discount}</span></div>}<div className="flex justify-between"><span>{labels.vat}</span><span>SAR {vat}</span></div><div className="flex justify-between border-t border-white/10 pt-4 text-base text-white"><span>{labels.total}</span><span>SAR {total}</span></div></div>
          <div className="mt-8 border-t border-white/10 pt-7"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{labels.delivery}</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={labels.name} className="border border-white/15 bg-transparent px-3 py-3 text-xs outline-none placeholder:text-white/30 focus:border-[#22d3ee]" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={labels.email} className="border border-white/15 bg-transparent px-3 py-3 text-xs outline-none placeholder:text-white/30 focus:border-[#22d3ee]" /><input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={`${labels.phone} (+966)`} className="border border-white/15 bg-transparent px-3 py-3 text-xs outline-none placeholder:text-white/30 focus:border-[#22d3ee]" /><input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder={labels.address} className="border border-white/15 bg-transparent px-3 py-3 text-xs outline-none placeholder:text-white/30 focus:border-[#22d3ee] sm:col-span-2 lg:col-span-1" /><div className="relative"><select required value={city} onChange={(e) => setCity(e.target.value)} className="w-full appearance-none border border-white/15 bg-[#101416] px-3 py-3 text-xs text-white/60 outline-none focus:border-[#22d3ee]"><option value="">{labels.city}</option>{SAUDI_CITIES.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-white/40" /></div></div></div>
          <div className="mt-8 border-t border-white/10 pt-7"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{labels.payment}</p><div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1"><button onClick={() => setPaymentMethod("card")} className={`flex items-center gap-3 border px-3 py-3 text-left text-xs transition ${paymentMethod === "card" ? "border-[#22d3ee] bg-[#22d3ee]/10 text-white" : "border-white/15 text-white/50"}`}><CreditCard size={16} /> {labels.card}</button><button onClick={() => setPaymentMethod("apple")} className={`flex items-center gap-3 border px-3 py-3 text-left text-xs transition ${paymentMethod === "apple" ? "border-[#22d3ee] bg-[#22d3ee]/10 text-white" : "border-white/15 text-white/50"}`}><Smartphone size={16} /> {labels.apple}</button><button onClick={() => setPaymentMethod("cod")} className={`flex items-center gap-3 border px-3 py-3 text-left text-xs transition ${paymentMethod === "cod" ? "border-[#22d3ee] bg-[#22d3ee]/10 text-white" : "border-white/15 text-white/50"}`}><Truck size={16} /> {labels.cod}</button></div>{paymentMethod === "card" && <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1"><input placeholder={labels.cardNumber} inputMode="numeric" className="border border-white/15 bg-transparent px-3 py-3 text-xs outline-none placeholder:text-white/30 focus:border-[#22d3ee] sm:col-span-3 lg:col-span-1" /><input placeholder={labels.expiry} className="border border-white/15 bg-transparent px-3 py-3 text-xs outline-none placeholder:text-white/30 focus:border-[#22d3ee]" /><input placeholder={labels.cvc} className="border border-white/15 bg-transparent px-3 py-3 text-xs outline-none placeholder:text-white/30 focus:border-[#22d3ee]" /></div>}</div>
          {submitError && <p className="mt-6 flex items-center gap-2 border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"><AlertCircle size={14} className="shrink-0" /> {submitError}</p>}
          <button onClick={submitOrder} disabled={!canSubmit || submitting} className="mt-8 flex w-full items-center justify-between bg-[#22d3ee] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#080a0c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? (isArabic ? "جارٍ المعالجة..." : "Processing...") : labels.pay}<ArrowUpRight size={16} /></button><p className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-[0.12em] text-white/35"><LockKeyhole size={12} /> {labels.secure}</p>
        </div>
      </div></section>}
    </main>
  );
}
