"use client";

import { ArrowUpRight, Check, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { SiteNav } from "@/components/site-nav";

const productImages = {
  headphones: "/ChatGPT%20Image%20Aug%2027,%202026,%2005_22_17%20PM.png",
  earbuds: "/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_17%20PM.png",
  speakers: "/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_32%20PM.png",
};

const catalog = {
  "x7-pro": {
    name: "X7 Pro",
    category: "Wireless headphones",
    description: "Immersive sound, adaptive noise cancellation, and all-day comfort engineered for the way you move.",
    price: 499,
    image: productImages.headphones,
    features: ["40 hours battery life", "Adaptive noise cancellation", "Bluetooth 5.3", "IPX5 water resistant"],
  },
  "x5-core": {
    name: "X5 Core",
    category: "Wireless headphones",
    description: "Deep bass, a balanced fit, and dependable battery life for everyday listening.",
    price: 349,
    image: productImages.headphones,
    features: ["32 hours battery life", "Deep bass tuning", "Bluetooth 5.3", "Comfort-fit cushions"],
  },
  "air-one": {
    name: "Air One",
    category: "True wireless earbuds",
    description: "Small form, big sound. A pocket-sized listening experience with clarity that stays with you.",
    price: 299,
    image: productImages.earbuds,
    features: ["28 hours total battery", "Clear call microphones", "Bluetooth 5.3", "IPX5 water resistant"],
  },
  "air-pro": {
    name: "Air Pro",
    category: "True wireless earbuds",
    description: "Spatial audio and adaptive noise control in a refined, pocket-ready silhouette.",
    price: 399,
    image: productImages.earbuds,
    features: ["32 hours total battery", "Spatial audio", "Adaptive noise cancellation", "IPX5 water resistant"],
  },
  "pulse-mini": {
    name: "Pulse Mini",
    category: "Bluetooth speakers",
    description: "Room-filling 360-degree sound in a compact speaker made to move with you.",
    price: 249,
    image: productImages.speakers,
    features: ["12 hours playtime", "360-degree sound", "Bluetooth 5.3", "IPX7 water resistant"],
  },
  "pulse-max": {
    name: "Pulse Max",
    category: "Bluetooth speakers",
    description: "Powerful bass, outdoor-ready protection, and a confident soundstage for bigger moments.",
    price: 599,
    image: productImages.speakers,
    features: ["20 hours playtime", "Powerful bass", "Bluetooth 5.3", "IPX7 water resistant"],
  },
} as const;

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isArabic } = useLocale();
  const product = catalog[slug as keyof typeof catalog];

  if (!product) return null;
  const labels = isArabic ? {
    designed: "مصمم في المملكة العربية السعودية",
    freeDelivery: "توصيل مجاني",
    add: "أضف إلى السلة",
    delivery: "توصيل سريع داخل السعودية",
    warranty: "ضمان لمدة عامين",
    returns: "إرجاع سهل",
    engineered: "مصمم لأداء أعلى",
    back: "العودة إلى المجموعة",
  } : {
    designed: "Designed in Saudi Arabia",
    freeDelivery: "Free delivery",
    add: "Add to cart",
    delivery: "Fast Saudi delivery",
    warranty: "Two-year warranty",
    returns: "Easy returns",
    engineered: "Engineered for more",
    back: "Back to collection",
  };
  const features = isArabic ? ["٤٠ ساعة من عمر البطارية", "إلغاء ضوضاء متكيف", "Bluetooth 5.3", "مقاوم للماء IPX5"] : product.features;

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>
      <section className="mx-auto grid max-w-[1440px] gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-24 lg:px-12 lg:py-20"><div className="relative aspect-square overflow-hidden border border-white/10 bg-[#151a1c] shadow-2xl shadow-cyan-950/20"><div className="absolute inset-0 bg-cover bg-center opacity-90 transition duration-700 hover:scale-105" style={{ backgroundImage: `linear-gradient(135deg, rgba(8,10,12,.02), rgba(8,10,12,.48)), url(${product.image})` }} /><div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#080a0c]/80 to-transparent" /><span className="absolute bottom-6 left-6 border border-[#9ff6ed]/40 bg-[#080a0c]/70 px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-[#9ff6ed] backdrop-blur-sm">{labels.designed}</span></div><div><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ff6ed]">{product.category}</p><h1 className="display-font text-7xl font-semibold uppercase leading-[0.85] sm:text-8xl">{product.name}</h1><p className="mt-8 max-w-md text-base leading-8 text-white/55">{isArabic ? (product.name === "X7 Pro" ? "صوت غامر، وإلغاء ضوضاء متكيف، وراحة طوال اليوم مصممة لحركتك." : "حجم صغير، صوت كبير. تجربة استماع بحجم الجيب مع وضوح يرافقك.") : product.description}</p><div className="mt-8 flex items-center gap-5"><span className="text-2xl">SAR {product.price}</span><span className="text-xs text-white/40">{labels.freeDelivery}</span></div><button className="mt-9 flex w-full items-center justify-between bg-[#9ff6ed] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.17em] text-[#080a0c] transition hover:bg-white sm:w-80">{labels.add} <ArrowUpRight size={16} /></button><div className="mt-10 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3"><div className="flex gap-3 text-[10px] uppercase leading-4 tracking-[0.1em] text-white/55"><Truck size={16} className="shrink-0 text-[#9ff6ed]" /> {labels.delivery}</div><div className="flex gap-3 text-[10px] uppercase leading-4 tracking-[0.1em] text-white/55"><ShieldCheck size={16} className="shrink-0 text-[#9ff6ed]" /> {labels.warranty}</div><div className="flex gap-3 text-[10px] uppercase leading-4 tracking-[0.1em] text-white/55"><Check size={16} className="shrink-0 text-[#9ff6ed]" /> {labels.returns}</div></div></div></section>
      <section className="border-y border-white/10 bg-[#0d1113] px-6 py-16 lg:px-12"><div className="mx-auto max-w-[1440px]"><p className="mb-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ff6ed]">{labels.engineered}</p><div className="grid gap-0 border-l border-white/10 sm:grid-cols-2 lg:grid-cols-4">{features.map((feature) => <div key={feature} className="border-b border-r border-white/10 px-5 py-6 text-sm text-white/70 lg:border-b-0"><div className="mb-8 size-2 bg-[#9ff6ed]" />{feature}</div>)}</div></div></section>
      <footer className="px-6 py-10 lg:px-12"><div className="mx-auto flex max-w-[1440px] justify-between text-[10px] uppercase tracking-[0.15em] text-white/40"><span>CELIBERY / Sound without limits.</span><Link href="/shop">{labels.back} ↑</Link></div></footer>
    </main>
  );
}
