"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { useLocale } from "@/components/locale-provider";
import {
  ArrowDownRight,
  ArrowUpRight,
  Headphones,
  Sparkles,
  Volume2,
} from "lucide-react";

const categories = [
  {
    label: "Headphones",
    detail: "Immersive. Powerful. Personal.",
    image: "/ChatGPT%20Image%20Aug%2027,%202026,%2005_22_17%20PM.png",
  },
  {
    label: "Earbuds",
    detail: "Small form. Big sound.",
    image: "/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_17%20PM.png",
  },
  {
    label: "Speakers",
    detail: "Turn every moment up.",
    image: "/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_32%20PM.png",
  },
];

const stats = [
  ["40H", "Battery life"],
  ["ANC", "Noise cancellation"],
  ["5.3", "Bluetooth"],
];

const mediaGallery = [
  { type: "image", src: "/WhatsApp%20Image%202026-09-08%20at%2007.52.46.jpeg", className: "md:col-span-2" },
  { type: "image", src: "/WhatsApp%20Image%202026-09-08%20at%2007.52.46%20(1).jpeg", className: "" },
  { type: "video", src: "/CELIBERY_Bluetooth_speaker_comme%E2%80%A6_202609080042.mp4", className: "md:row-span-2" },
  { type: "image", src: "/WhatsApp%20Image%202026-09-08%20at%2007.52.46%20(2).jpeg", className: "" },
  { type: "image", src: "/WhatsApp%20Image%202026-09-08%20at%2007.52.47.jpeg", className: "" },
  { type: "video", src: "/Friends_playing_football_with_sp%E2%80%A6_202609080042.mp4", className: "md:col-span-2" },
  { type: "image", src: "/WhatsApp%20Image%202026-09-08%20at%2007.52.47%20(1).jpeg", className: "" },
  { type: "image", src: "/WhatsApp%20Image%202026-09-08%20at%2007.52.48.jpeg", className: "" },
  { type: "video", src: "/WhatsApp%20Video%202026-09-08%20at%2007.52.47.mp4", className: "md:col-span-2" },
];

export default function Home() {
  const { isArabic } = useLocale();
  const copy = isArabic ? {
    eyebrow: "جيل جديد من الصوت",
    heroLast: "بلا حدود.",
    explore: "استكشف المجموعة",
    discover: "اكتشف CELIBERY",
    country: "المملكة العربية السعودية / ٢٠٢٦",
    subline: "صوت فاخر مصمم لحياتك اليومية.",
    scroll: "مرر للاستكشاف",
    collection: "اكتشف ترددك",
    choose: "اختر صوتك.",
    featured: "السلسلة المميزة / X7 Pro",
    hear: "اسمع كل تفصيل.",
    featuredBody: "صوت غامر، وإلغاء ضوضاء متكيف، وراحة طوال اليوم مصممة لحركتك.",
    discoverX7: "اكتشف X7 Pro",
    why: "لماذا CELIBERY",
    follow: "الصوت يجب أن يرافقك.",
    philosophy: "فلسفتنا",
  } : {
    eyebrow: "New era of sound",
    heroLast: "limits.",
    explore: "Explore collection",
    discover: "Discover CELIBERY",
    country: "Saudi Arabia / 2026",
    subline: "Premium audio engineered for everyday life.",
    scroll: "Scroll to explore",
    collection: "Find your frequency",
    choose: "Choose your sound.",
    featured: "The signature series / X7 Pro",
    hear: "Hear every detail.",
    featuredBody: "Immersive sound, adaptive noise cancellation, and all-day comfort engineered for the way you move.",
    discoverX7: "Discover X7 Pro",
    why: "Why CELIBERY",
    follow: "Sound should follow you.",
    philosophy: "Our philosophy",
  };

  return (
    <main className="overflow-hidden bg-[#080a0c] text-[#f3f5f5]">
      <section className="relative min-h-[720px] h-screen max-h-[980px] overflow-hidden border-b border-white/10">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-screen"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_32%20PM.png"
          aria-hidden="true"
        >
          <source src="/Person_holding_Bluetooth_speaker_202609080042.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 bg-linear-to-r from-[#080a0c] via-[#080a0c]/65 to-[#080a0c]/10"
        />
        <div className="grain absolute inset-0" />
        <SiteNav overlay />

        <div id="top" className="relative z-10 mx-auto flex h-[calc(100%-100px)] max-w-[1440px] flex-col justify-end px-6 pb-12 lg:px-12 lg:pb-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ff6ed]"><Sparkles size={13} /> {copy.eyebrow}</p>
            <h1 className="display-font max-w-xl text-7xl font-semibold uppercase leading-[0.85] sm:text-8xl lg:text-[9.5rem]">{isArabic ? <>صوت<br />{copy.heroLast}</> : <>Sound<br />without<br /><span className="text-white/45">{copy.heroLast}</span></>}</h1>
            <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center">
              <Link href="/shop" className="group inline-flex w-fit items-center gap-8 bg-[#9ff6ed] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#080a0c] transition hover:bg-white">{copy.explore} <ArrowUpRight size={15} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
              <a href="#story" className="inline-flex w-fit items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 transition hover:text-[#9ff6ed]">{copy.discover} <ArrowDownRight size={15} /></a>
            </div>
          </motion.div>
          <div className="mt-12 flex items-end justify-between border-t border-white/20 pt-4 text-[10px] uppercase tracking-[0.17em] text-white/45">
            <span>{copy.country}</span><span className="hidden sm:block">{copy.subline}</span><span className="flex items-center gap-2">{copy.scroll} <ArrowDownRight size={13} /></span>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0d1113] px-6 py-5 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-5 text-[10px] uppercase tracking-[0.16em] text-white/55 sm:grid-cols-4">
          {[["01", "Fast Saudi delivery"], ["02", "Secure payment"], ["03", "Two-year warranty"], ["04", "Here when you need us"]].map(([number, label]) => <div key={number} className="flex items-center gap-3"><span className="text-[#9ff6ed]">{number}</span>{label}</div>)}
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12 lg:py-36">
        <div className="mb-12 flex items-end justify-between gap-5"><div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ff6ed]">{copy.collection}</p><h2 className="display-font text-5xl font-semibold uppercase sm:text-7xl">{isArabic ? <>اختر<br />صوتك.</> : <>Choose<br />your sound.</>}</h2></div><Link href="/shop" className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.17em] text-white/60 transition hover:text-[#9ff6ed] sm:flex">{isArabic ? "عرض كل المنتجات" : "View all products"} <ArrowUpRight size={15} /></Link></div>
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category, index) => <motion.a whileHover={{ y: -5 }} transition={{ duration: 0.25 }} href={`/shop?category=${category.label.toLowerCase()}`} key={category.label} className="group relative aspect-[0.82] overflow-hidden bg-[#151a1c] p-6 sm:p-8"><div className="absolute inset-0 bg-cover bg-center opacity-65 transition duration-700 group-hover:scale-105 group-hover:opacity-90" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,10,12,.12), #080a0c 95%), url(${category.image})` }} /><div className="relative flex h-full flex-col justify-between"><span className="flex size-9 items-center justify-center rounded-full border border-white/30 text-xs text-white/60">0{index + 1}</span><div><h3 className="display-font text-4xl font-semibold uppercase">{category.label}</h3><p className="mt-2 text-sm text-white/55">{category.detail}</p><span className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ff6ed] opacity-0 transition group-hover:opacity-100">Explore <ArrowUpRight size={14} /></span></div></div></motion.a>)}
        </div>
      </section>

      <section id="featured" className="relative border-y border-white/10 bg-[#101416] px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ff6ed]">{copy.featured}</p><h2 className="display-font text-6xl font-semibold uppercase leading-[0.88] sm:text-8xl">{isArabic ? <>اسمع<br />كل<br /><span className="text-white/35">تفصيل.</span></> : <>Hear<br />every<br /><span className="text-white/35">detail.</span></>}</h2><p className="mt-8 max-w-sm text-sm leading-7 text-white/55">{copy.featuredBody}</p><div className="mt-10 flex items-center gap-5"><Link href="/shop/x7-pro" className="inline-flex items-center gap-6 bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#080a0c] transition hover:bg-[#9ff6ed]">{copy.discoverX7} <ArrowUpRight size={15} /></Link><span className="text-sm text-white/45">SAR 499</span></div></div>
          <div className="relative aspect-[1.1] overflow-hidden bg-[#171d1e]"><div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "linear-gradient(90deg, rgba(16,20,22,.1), rgba(16,20,22,.3)), url('/ChatGPT%20Image%20Aug%2027,%202026,%2005_22_17%20PM.png')" }} /><div className="absolute bottom-6 left-6 flex gap-2">{stats.map(([value, label]) => <div key={value} className="border border-white/20 bg-[#080a0c]/75 px-3 py-3 backdrop-blur-md"><p className="text-sm font-semibold text-[#9ff6ed]">{value}</p><p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-white/55">{label}</p></div>)}</div></div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0d1113] px-6 py-6 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="group relative min-h-[430px] overflow-hidden bg-[#151a1c] sm:min-h-[500px] lg:min-h-[520px]">
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-1000 group-hover:scale-105 group-hover:opacity-90"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_32%20PM.png"
              aria-label={isArabic ? "فيديو تجربة CELIBERY الصوتية" : "CELIBERY sound experience video"}
            >
              <source src="/Person_holding_Bluetooth_speaker_202609080042.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#080a0c] via-transparent to-transparent" />
            <div className="absolute bottom-7 left-6 right-6 flex items-end justify-between gap-5 sm:left-7 sm:right-7 lg:bottom-10 lg:left-10 lg:right-10">
              <div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9ff6ed]">{isArabic ? "صوت يتحرك معك" : "Sound in motion"}</p><h2 className="display-font max-w-lg text-4xl font-semibold uppercase leading-[0.9] sm:text-6xl">{isArabic ? <>استمع<br />بشكل مختلف.</> : <>Listen<br />differently.</>}</h2></div>
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-full border border-white/30 text-[#9ff6ed] sm:flex"><ArrowUpRight size={18} /></span>
            </div>
          </div>
          <div className="flex min-h-[360px] flex-col justify-between bg-[#9ff6ed] p-7 text-[#080a0c] lg:min-h-[520px] lg:p-10">
            <div className="flex items-center justify-between"><Headphones size={24} strokeWidth={1.25} /><span className="text-[10px] font-bold uppercase tracking-[0.18em]">CELIBERY / 01</span></div>
            <div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em]">{isArabic ? "هندسة الصوت" : "Audio engineering"}</p><p className="max-w-xs text-3xl font-semibold leading-[0.95] tracking-[-0.05em]">{isArabic ? "تفاصيل أكثر. ضوضاء أقل. حرية أكبر." : "More detail. Less noise. More freedom."}</p><Link href="/shop/x7-pro" className="mt-8 inline-flex items-center gap-3 border-b border-[#080a0c] pb-2 text-[10px] font-bold uppercase tracking-[0.16em]">{isArabic ? "اكتشف X7 Pro" : "Discover X7 Pro"} <ArrowUpRight size={15} /></Link></div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ff6ed]">CELIBERY / In the wild</p><h2 className="display-font max-w-xl text-5xl font-semibold uppercase leading-[0.9] sm:text-7xl">Sound<br /><span className="text-white/35">in motion.</span></h2></div>
            <p className="hidden max-w-xs text-right text-xs leading-6 text-white/45 sm:block">Designed for real days, long nights, open roads, and every room in between.</p>
          </div>
          <div className="grid auto-rows-[minmax(190px,24vw)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {mediaGallery.map((media) => media.type === "video" ? <video key={media.src} className={`h-full w-full object-cover ${media.className}`} autoPlay muted loop playsInline preload="metadata"><source src={media.src} type="video/mp4" /></video> : <div key={media.src} className={`h-full w-full bg-cover bg-center ${media.className}`} style={{ backgroundImage: `url(${media.src})` }} />)}
          </div>
        </div>
      </section>

      <section id="story" className="mx-auto grid max-w-[1440px] gap-12 px-6 py-24 lg:grid-cols-[1fr_1fr] lg:items-end lg:px-12 lg:py-36"><div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ff6ed]">{copy.why}</p><h2 className="display-font max-w-2xl text-5xl font-semibold uppercase leading-[0.9] sm:text-7xl">{isArabic ? <>الصوت يجب<br /><span className="text-white/35">أن يرافقك.</span></> : <>Sound should<br /><span className="text-white/35">follow you.</span></>}</h2></div><div className="max-w-md justify-self-end"><div className="mb-8 flex items-center gap-3 text-[#9ff6ed]"><Volume2 size={19} strokeWidth={1.5} /><span className="text-[10px] uppercase tracking-[0.18em]">{isArabic ? "مصمم لكل تردد" : "Built for every frequency"}</span></div><p className="text-lg leading-8 text-white/55">{isArabic ? "من أول نغمة في الرياض إلى آخر ضوء على البحر الأحمر، تمنحك CELIBERY تفاصيل وعمقاً وحرية في كل لحظة." : "From the first note in Riyadh to the last light on the Red Sea, CELIBERY brings detail, depth, and freedom to every moment."}</p><Link href="/shop" className="mt-8 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:text-[#9ff6ed]">{copy.philosophy} <ArrowUpRight size={15} /></Link></div></section>

      <footer className="border-t border-white/10 px-6 py-10 lg:px-12"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><div className="brand-mark mb-4" role="img" aria-label="CELIBERY" /><p className="text-xs text-white/40">Sound without limits.</p></div><div className="flex gap-6 text-[10px] uppercase tracking-[0.16em] text-white/45"><a href="#shop" className="transition hover:text-white">Shop</a><a href="#story" className="transition hover:text-white">Support</a><a href="#story" className="transition hover:text-white">Instagram</a></div></div></footer>
    </main>
  );
}
