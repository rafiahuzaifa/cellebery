"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { MediaVideo } from "@/components/media-video";
import { useLocale } from "@/components/locale-provider";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Battery,
  Briefcase,
  Clock,
  Droplets,
  Dumbbell,
  Ear,
  Heart,
  Headphones,
  Home as HomeIcon,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Speaker,
  Star,
  Volume2,
  Waves,
} from "lucide-react";

const categories = [
  {
    label: "Headphones",
    detail: "Immersive. Powerful. Personal.",
    image: "/products/headphones-classic.jpg",
    icon: Headphones,
  },
  {
    label: "Earbuds",
    detail: "Small form. Big sound.",
    image: "/products/earbuds-case.jpg",
    icon: Ear,
  },
  {
    label: "Speakers",
    detail: "Turn every moment up.",
    image: "/products/speaker-hero.jpg",
    icon: Speaker,
  },
];

const stats = [
  ["40H", "Battery life"],
  ["ANC", "Noise cancellation"],
  ["5.3", "Bluetooth"],
];

const heroFeatures = [
  { icon: Waves, en: "Hi-Fi Sound", ar: "صوت عالي الدقة" },
  { icon: ShieldCheck, en: "Active Cancellation", ar: "إلغاء ضوضاء نشط" },
  { icon: Battery, en: "Long Battery Life", ar: "بطارية تدوم طويلاً" },
  { icon: Droplets, en: "IPX5 Waterproof", ar: "مقاومة للماء IPX5" },
];

const whyItems = [
  { icon: Sparkles, en: ["Premium Sound", "Studio-grade drivers tuned for clarity."], ar: ["صوت فاخر", "دقة استوديو في كل تردد."] },
  { icon: Award, en: ["Modern Design", "Minimal forms, precision materials."], ar: ["تصميم عصري", "أشكال بسيطة وخامات دقيقة."] },
  { icon: Clock, en: ["All-Day Comfort", "Engineered to disappear on your ear."], ar: ["راحة طوال اليوم", "مصممة لتلائم يومك بالكامل."] },
  { icon: ShieldCheck, en: ["Built to Last", "Tested for the Saudi climate and beyond."], ar: ["مصنوع ليدوم", "مختبر لمناخ المملكة وأكثر."] },
];

const lifestyleItems = [
  { key: "travel", image: "/lifestyle/travel.jpg", icon: Plane, en: ["Travel", "Your soundtrack wherever you go."], ar: ["السفر", "رفيقك الصوتي أينما ذهبت."] },
  { key: "work", image: "/lifestyle/work.jpg", icon: Briefcase, en: ["Work", "Focus without distractions."], ar: ["العمل", "تركيز بلا تشتيت."] },
  { key: "fitness", video: "/Friends_playing_football_with_sp%E2%80%A6_202609080042.mp4", icon: Dumbbell, en: ["Fitness", "Music that keeps you moving."], ar: ["اللياقة", "موسيقى تواكب حركتك."] },
  { key: "home", image: "/lifestyle/home.jpg", icon: HomeIcon, en: ["Home", "Fill every room with sound."], ar: ["المنزل", "املأ كل غرفة بالصوت."] },
];

const bestSellers = [
  { id: "x7-pro", name: "CELIBERY X7 Pro", category: "Headphones", categoryAr: "سماعات رأس", image: "/products/x7-pro-hero.jpg", price: 499, compareAt: 699, rating: 4.9, reviews: 128 },
  { id: "air-one", name: "CELIBERY Air One", category: "Earbuds", categoryAr: "سماعات أذن", image: "/products/earbuds-case.jpg", price: 299, compareAt: null, rating: 4.8, reviews: 96 },
  { id: "pulse-mini", name: "CELIBERY Pulse Mini", category: "Speakers", categoryAr: "مكبر صوت", image: "/products/speaker-outdoor.jpg", price: 249, compareAt: 299, rating: 4.7, reviews: 64 },
  { id: "x5-core", name: "CELIBERY X5 Core", category: "Headphones", categoryAr: "سماعات رأس", image: "/products/headphones-detail.jpg", price: 349, compareAt: null, rating: 4.8, reviews: 84 },
];

const mediaGallery = [
  { type: "image", src: "/lifestyle/travel.jpg", className: "" },
  { type: "image", src: "/products/earbuds-hero.jpg", className: "" },
  { type: "video", src: "/CELIBERY_Bluetooth_speaker_comme%E2%80%A6_202609080042.mp4", className: "gallery-tile--tall" },
  { type: "image", src: "/lifestyle/work.jpg", className: "" },
  { type: "image", src: "/products/speaker-hero.jpg", className: "" },
  { type: "video", src: "/Friends_playing_football_with_sp%E2%80%A6_202609080042.mp4", className: "" },
  { type: "image", src: "/lifestyle/home.jpg", className: "" },
  { type: "video", src: "/WhatsApp%20Video%202026-09-08%20at%2007.52.47.mp4", className: "gallery-tile--wide" },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={11} className={star <= Math.round(rating) ? "fill-[#22d3ee] text-[#22d3ee]" : "text-white/20"} />
      ))}
    </span>
  );
}

export default function Home() {
  const { isArabic, locale } = useLocale();
  const { addItem } = useCart();
  const { isSaved, toggleItem } = useWishlist();
  const copy = isArabic ? {
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
    addToCart: "أضف إلى السلة",
    why: "لماذا CELIBERY",
    whyTitle: "لماذا تختار CELIBERY؟",
    follow: "الصوت يجب أن يرافقك.",
    philosophy: "فلسفتنا",
    designedFor: "مصمم لحياتك",
    designedForTitle: "أينما كنت.",
    mostWanted: "الأكثر طلباً",
    bestSellersTitle: "الأكثر مبيعاً.",
    viewProduct: "عرض المنتج",
    off: "خصم",
  } : {
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
    addToCart: "Add to cart",
    why: "Why CELIBERY",
    whyTitle: "Why choose CELIBERY?",
    follow: "Sound should follow you.",
    philosophy: "Our philosophy",
    designedFor: "Designed for your life",
    designedForTitle: "Wherever you are.",
    mostWanted: "Most wanted",
    bestSellersTitle: "Best sellers.",
    viewProduct: "View product",
    off: "OFF",
  };

  return (
    <main className="overflow-hidden bg-[#080a0c] text-[#f3f5f5]">
      <section className="relative min-h-screen overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-55" style={{ backgroundImage: "linear-gradient(180deg, rgba(8,10,12,.04), rgba(8,10,12,.76)), url('/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_32%20PM.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(3px)", transform: "scale(1.06)" }} />
        <div className="absolute inset-0 bg-linear-to-r from-[#080a0c] via-[#080a0c]/65 to-[#080a0c]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_36%,rgba(34,211,238,0.12),transparent_18%),radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.06),transparent_28%)]" />
        <div className="grain absolute inset-0" />
        <SiteNav overlay />

        <div id="top" className="relative z-10 mx-auto max-w-[1440px] px-6 pb-16 pt-28 sm:pt-32 lg:px-12 lg:pb-20 lg:pt-40">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(480px,0.95fr)_minmax(420px,1.05fr)] lg:gap-8">
            <div className="relative order-2 aspect-video w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1113] shadow-2xl shadow-cyan-950/50 lg:order-1 lg:aspect-auto lg:h-[520px]">
              <MediaVideo src="/Person_holding_Bluetooth_speaker_202609080042.mp4" poster="/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_32%20PM.png" className="absolute inset-0" label={isArabic ? "تفعيل أو كتم صوت الفيديو" : "Toggle sound"} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a0c]/55 via-transparent to-transparent" />
              <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#22d3ee]"><span className="inline-block h-px w-8 bg-[#22d3ee]" />CELIBERY 01</div>
              <div className="pointer-events-none absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">X7 Pro / 360°</span>
                <span className="grid size-10 place-items-center rounded-full border border-white/30 text-[#22d3ee]"><ArrowUpRight size={16} /></span>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-20 order-1 max-w-2xl lg:order-2 lg:justify-self-end">
              <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]"><span className="inline-block h-px w-10 bg-[#22d3ee]" />{isArabic ? "جيل جديد من الصوت" : "New era of sound"}</div>
              <h1 className="display-font max-w-[680px] text-[clamp(3rem,8vw,6.6rem)] font-semibold uppercase leading-[0.82] tracking-[-0.045em]">
                {isArabic ? <>
                  <span className="block">صوت</span>
                  <span className="block">بلا</span>
                  <span className="block">حدود</span>
                </> : <>
                  <span className="block">SOUND</span>
                  <span className="block text-white/45">WITHOUT</span>
                  <span className="block text-white/90">LIMITS</span>
                </>}
              </h1>
              <p className="mt-8 max-w-xl text-sm font-medium uppercase leading-7 tracking-[0.16em] text-white/60">{isArabic ? "صوت فاخر مصمم للحياة اليومية." : "Premium audio engineered for everyday life."}</p>
              <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center">
                <Link href={`/${locale}/shop`} className="group inline-flex w-fit items-center gap-8 bg-[#22d3ee] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#080a0c] transition hover:bg-white">{isArabic ? "استكشف المجموعة" : "EXPLORE COLLECTION"} <ArrowUpRight size={15} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
                <a href="#story" className="inline-flex w-fit items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 transition hover:text-[#22d3ee]">{isArabic ? "اكتشف CELIBERY" : "DISCOVER CELIBERY"} <ArrowDownRight size={15} /></a>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-6">
                {heroFeatures.map(({ icon: Icon, en, ar }) => (
                  <div key={en} className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/60">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#22d3ee]/50 text-[#22d3ee]"><Icon size={12} strokeWidth={1.75} /></span>
                    {isArabic ? ar : en}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          <div className="mt-14 flex flex-col gap-3 border-t border-white/20 pt-5 text-[10px] uppercase tracking-[0.17em] text-white/45 sm:flex-row sm:items-end sm:justify-between">
            <span>{copy.country}</span><span className="hidden sm:block">{copy.subline}</span><span className="flex items-center gap-2">{copy.scroll} <ArrowDownRight size={13} /></span>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0d1113] px-6 py-5 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-5 text-[10px] uppercase tracking-[0.16em] text-white/55 sm:grid-cols-4">
          {[["01", "Fast Saudi delivery"], ["02", "Secure payment"], ["03", "Two-year warranty"], ["04", "Here when you need us"]].map(([number, label]) => <div key={number} className="flex items-center gap-3"><span className="text-[#22d3ee]">{number}</span>{label}</div>)}
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12 lg:py-36">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{copy.collection}</p>
            <h2 className="display-font text-5xl font-semibold uppercase sm:text-7xl">{isArabic ? <>اختر<br />صوتك.</> : <>Choose<br />your sound.</>}</h2>
          </div>
          <Link href={`/${locale}/shop`} className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.17em] text-white/60 transition hover:text-[#22d3ee] sm:flex">{isArabic ? "عرض كل المنتجات" : "View all products"} <ArrowUpRight size={15} /></Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <motion.a whileHover={{ y: -5 }} transition={{ duration: 0.25 }} href={`/${locale}/shop?category=${category.label.toLowerCase()}`} key={category.label} className="group relative aspect-[0.82] overflow-hidden bg-[#151a1c] p-6 sm:p-8">
              <div className="full-media absolute inset-0 opacity-65 transition duration-700 group-hover:opacity-90" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,10,12,.12), #080a0c 95%), url(${category.image})` }} />
              <div className="absolute inset-0 border border-white/10 transition group-hover:border-[#22d3ee]/60" />
              <div className="relative flex h-full flex-col justify-between">
                <span className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-[#080a0c]/50 text-[#22d3ee] backdrop-blur-sm"><category.icon size={16} strokeWidth={1.5} /></span>
                <div>
                  <h3 className="display-font text-4xl font-semibold uppercase">{category.label}</h3>
                  <p className="mt-2 text-sm text-white/55">{category.detail}</p>
                  <span className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#22d3ee] opacity-0 transition group-hover:opacity-100">Explore <ArrowUpRight size={14} /></span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      <section id="featured" className="relative border-y border-white/10 bg-[#101416] px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{copy.featured}</p>
            <h2 className="display-font text-6xl font-semibold uppercase leading-[0.88] sm:text-8xl">{isArabic ? <>اسمع<br />كل<br /><span className="text-white/35">تفصيل.</span></> : <>Hear<br />every<br /><span className="text-white/35">detail.</span></>}</h2>
            <p className="mt-8 max-w-sm text-sm leading-7 text-white/55">{copy.featuredBody}</p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <div className="flex items-baseline gap-3"><span className="text-2xl font-semibold text-white">SAR 499</span><span className="text-sm text-white/35 line-through">SAR 699</span><span className="rounded-full bg-[#22d3ee]/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#22d3ee]">29% {copy.off}</span></div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button onClick={() => addItem({ id: "x7-pro", name: "CELIBERY X7 Pro", price: 499, image: "/products/headphones-detail.jpg" })} className="inline-flex items-center gap-4 bg-[#22d3ee] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#080a0c] transition hover:bg-white"><ShoppingBag size={15} /> {copy.addToCart}</button>
              <Link href={`/${locale}/shop/x7-pro`} className="inline-flex items-center gap-6 border border-white/20 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#22d3ee] hover:text-[#22d3ee]">{copy.discoverX7} <ArrowUpRight size={15} /></Link>
            </div>
          </div>
          <div className="relative aspect-[1.1] overflow-hidden bg-[#171d1e]">
            <div className="full-media absolute inset-0 opacity-90" style={{ backgroundImage: "url('/products/headphones-detail.jpg')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080a0c]/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 flex gap-2">{stats.map(([value, label]) => <div key={value} className="border border-white/20 bg-[#080a0c]/75 px-3 py-3 backdrop-blur-md"><p className="text-sm font-semibold text-[#22d3ee]">{value}</p><p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-white/55">{label}</p></div>)}</div>
            <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm"><span>01</span><span className="text-white/40">/</span><span>X7 Pro</span></div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{copy.why}</p>
          <h2 className="display-font mx-auto max-w-2xl text-center text-4xl font-semibold uppercase leading-[0.95] sm:text-6xl">{copy.whyTitle}</h2>
          <div className="mt-14 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {whyItems.map(({ icon: Icon, en, ar }) => {
              const [title, body] = isArabic ? ar : en;
              return (
                <div key={title} className="flex flex-col gap-4 bg-[#0d1113] p-7">
                  <span className="grid size-11 place-items-center rounded-full border border-[#22d3ee]/50 text-[#22d3ee]"><Icon size={18} strokeWidth={1.5} /></span>
                  <div><h3 className="text-lg font-semibold tracking-[-0.02em]">{title}</h3><p className="mt-2 text-xs leading-6 text-white/50">{body}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0d1113] px-6 py-6 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="group relative min-h-[430px] overflow-hidden bg-[#151a1c] sm:min-h-[500px] lg:min-h-[520px]">
            <MediaVideo src="/Person_holding_Bluetooth_speaker_202609080042.mp4" poster="/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_32%20PM.png" className="absolute inset-0 h-full w-full opacity-70 transition duration-1000 group-hover:opacity-90" label={isArabic ? "تفعيل أو كتم صوت الفيديو" : "Toggle sound"} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080a0c] via-transparent to-transparent" />
            <div className="absolute bottom-7 left-6 right-6 flex items-end justify-between gap-5 sm:left-7 sm:right-7 lg:bottom-10 lg:left-10 lg:right-10">
              <div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#22d3ee]">{isArabic ? "صوت يتحرك معك" : "Sound in motion"}</p><h2 className="display-font max-w-lg text-4xl font-semibold uppercase leading-[0.9] sm:text-6xl">{isArabic ? <>استمع<br />بشكل مختلف.</> : <>Listen<br />differently.</>}</h2></div>
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-full border border-white/30 text-[#22d3ee] sm:flex"><ArrowUpRight size={18} /></span>
            </div>
          </div>
          <div className="flex min-h-[360px] flex-col justify-between bg-[#22d3ee] p-7 text-[#080a0c] lg:min-h-[520px] lg:p-10">
            <div className="flex items-center justify-between"><Headphones size={24} strokeWidth={1.25} /><span className="text-[10px] font-bold uppercase tracking-[0.18em]">CELIBERY / 01</span></div>
            <div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em]">{isArabic ? "هندسة الصوت" : "Audio engineering"}</p><p className="max-w-xs text-3xl font-semibold leading-[0.95] tracking-[-0.05em]">{isArabic ? "تفاصيل أكثر. ضوضاء أقل. حرية أكبر." : "More detail. Less noise. More freedom."}</p><Link href={`/${locale}/shop/x7-pro`} className="mt-8 inline-flex items-center gap-3 border-b border-[#080a0c] pb-2 text-[10px] font-bold uppercase tracking-[0.16em]">{isArabic ? "اكتشف X7 Pro" : "Discover X7 Pro"} <ArrowUpRight size={15} /></Link></div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">CELIBERY / In the wild</p><h2 className="display-font max-w-xl text-5xl font-semibold uppercase leading-[0.9] sm:text-7xl">Sound<br /><span className="text-white/35">in motion.</span></h2></div>
            <p className="hidden max-w-xs text-right text-xs leading-6 text-white/45 sm:block">Designed for real days, long nights, open roads, and every room in between.</p>
          </div>
          <div className="gallery-grid">
            {mediaGallery.map((media) => media.type === "video" ? (
              <div key={media.src} className={`gallery-tile gallery-video-tile ${media.className}`}>
                <MediaVideo src={media.src} className="h-full w-full" label={isArabic ? "تفعيل أو كتم صوت الفيديو" : "Toggle sound"} />
              </div>
            ) : (
              <div key={media.src} className={`gallery-tile gallery-image-tile ${media.className}`} style={{ backgroundImage: `url(${media.src})` }} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#101416] px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{copy.designedFor}</p>
              <h2 className="display-font text-5xl font-semibold uppercase sm:text-7xl">{copy.designedForTitle}</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lifestyleItems.map(({ key, image, video, icon: Icon, en, ar }) => {
              const [title, caption] = isArabic ? ar : en;
              return (
                <div key={key} className="group relative aspect-[3/4] overflow-hidden bg-[#151a1c]">
                  {video ? (
                    <video className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 group-hover:opacity-95" autoPlay muted loop playsInline preload="metadata">
                      <source src={video} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="full-media absolute inset-0 opacity-75 transition duration-700 group-hover:opacity-95" style={{ backgroundImage: `url(${image})` }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080a0c] via-[#080a0c]/10 to-transparent" />
                  <div className="absolute inset-0 border border-white/10 transition group-hover:border-[#22d3ee]/50" />
                  <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-white/25 bg-[#080a0c]/50 text-[#22d3ee] backdrop-blur-sm"><Icon size={15} strokeWidth={1.5} /></span>
                  <div className="absolute bottom-5 left-5 right-5"><h3 className="text-xl font-semibold uppercase tracking-[-0.02em]">{title}</h3><p className="mt-1.5 text-xs leading-5 text-white/55">{caption}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{copy.mostWanted}</p>
              <h2 className="display-font text-5xl font-semibold uppercase sm:text-7xl">{copy.bestSellersTitle}</h2>
            </div>
            <Link href={`/${locale}/shop`} className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.17em] text-white/60 transition hover:text-[#22d3ee] sm:flex">{isArabic ? "عرض كل المنتجات" : "View all products"} <ArrowUpRight size={15} /></Link>
          </div>
          <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product) => {
              const saved = isSaved(product.id);
              return (
                <article key={product.id} className="group">
                  <div className="relative aspect-[0.92] overflow-hidden bg-[#151a1c]">
                    <div className="full-media absolute inset-0 opacity-85 transition duration-700 group-hover:opacity-100" style={{ backgroundImage: `url(${product.image})` }} />
                    {product.compareAt && <span className="absolute left-4 top-4 rounded-full bg-[#22d3ee] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#080a0c]">{Math.round(100 - (product.price / product.compareAt) * 100)}% {copy.off}</span>}
                    <button aria-label={`${saved ? "Remove" : "Add"} ${product.name} ${saved ? "from" : "to"} wishlist`} onClick={() => toggleItem({ id: product.id, name: product.name, price: product.price, image: product.image })} className={`absolute right-4 top-4 grid size-9 place-items-center rounded-full border backdrop-blur-sm transition ${saved ? "border-[#22d3ee] bg-[#22d3ee] text-[#080a0c]" : "border-white/25 bg-[#080a0c]/40 text-white/75 hover:border-[#22d3ee] hover:text-[#22d3ee]"}`}><Heart size={14} fill={saved ? "currentColor" : "none"} strokeWidth={1.5} /></button>
                    <button aria-label={`${copy.addToCart}: ${product.name}`} onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })} className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-center gap-2 bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#080a0c] transition duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"><ShoppingBag size={13} /> {copy.addToCart}</button>
                  </div>
                  <div className="pt-5">
                    <Link href={`/${locale}/shop/${product.id}`} className="text-base font-semibold tracking-[-0.02em] transition hover:text-[#22d3ee]">{product.name}</Link>
                    <div className="mt-2 flex items-center gap-2"><RatingStars rating={product.rating} /><span className="text-[10px] text-white/40">({product.reviews})</span></div>
                    <div className="mt-2 flex items-baseline gap-2"><span className="text-sm text-white/85">SAR {product.price}</span>{product.compareAt && <span className="text-xs text-white/35 line-through">SAR {product.compareAt}</span>}</div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="story" className="mx-auto grid max-w-[1440px] gap-12 px-6 py-24 lg:grid-cols-[1fr_1fr] lg:items-end lg:px-12 lg:py-36"><div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{copy.why}</p><h2 className="display-font max-w-2xl text-5xl font-semibold uppercase leading-[0.9] sm:text-7xl">{isArabic ? <>الصوت يجب<br /><span className="text-white/35">أن يرافقك.</span></> : <>Sound should<br /><span className="text-white/35">follow you.</span></>}</h2></div><div className="max-w-md justify-self-end"><div className="mb-8 flex items-center gap-3 text-[#22d3ee]"><Volume2 size={19} strokeWidth={1.5} /><span className="text-[10px] uppercase tracking-[0.18em]">{isArabic ? "مصمم لكل تردد" : "Built for every frequency"}</span></div><p className="text-lg leading-8 text-white/55">{isArabic ? "من أول نغمة في الرياض إلى آخر ضوء على البحر الأحمر، تمنحك CELIBERY تفاصيل وعمقاً وحرية في كل لحظة." : "From the first note in Riyadh to the last light on the Red Sea, CELIBERY brings detail, depth, and freedom to every moment."}</p><Link href={`/${locale}/shop`} className="mt-8 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:text-[#22d3ee]">{copy.philosophy} <ArrowUpRight size={15} /></Link></div></section>

      <footer className="border-t border-white/10 px-6 py-10 lg:px-12"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><div className="brand-mark mb-4" role="img" aria-label="CELIBERY"><Image src="/celibery-logo.svg" alt="CELIBERY" width={150} height={38} className="brand-logo" /></div><p className="text-xs text-white/40">Sound without limits.</p></div><div className="flex gap-6 text-[10px] uppercase tracking-[0.16em] text-white/45"><a href="#shop" className="transition hover:text-white">Shop</a><a href="#story" className="transition hover:text-white">Support</a><a href="#story" className="transition hover:text-white">Instagram</a></div></div></footer>
    </main>
  );
}
