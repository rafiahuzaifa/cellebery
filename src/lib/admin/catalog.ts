export type AdminProductStatus = "draft" | "active" | "archived";
export type AdminCategory = "headphones" | "earbuds" | "speakers" | "accessories";

export type AdminProductTranslation = {
  name: string;
  shortDescription: string;
  description: string;
  features: string[];
  seoTitle: string;
  seoDescription: string;
};

export type AdminProduct = {
  id: string;
  sku: string;
  category: AdminCategory;
  price: number;
  salePrice: number | null;
  stock: number;
  lowStockThreshold: number;
  warrantyMonths: number;
  status: AdminProductStatus;
  image: string;
  rating: number;
  reviewCount: number;
  updatedAt: string;
  en: AdminProductTranslation;
  ar: AdminProductTranslation;
};

export function translationStatus(product: AdminProduct): "complete" | "partial" | "missing" {
  const fields = [product.ar.name, product.ar.shortDescription, product.ar.description];
  const filled = fields.filter((field) => field.trim().length > 0).length;
  if (filled === fields.length) return "complete";
  if (filled === 0) return "missing";
  return "partial";
}

export const seedAdminProducts: AdminProduct[] = [
  {
    id: "x7-pro",
    sku: "CEL-HP-X7PRO",
    category: "headphones",
    price: 699,
    salePrice: 499,
    stock: 84,
    lowStockThreshold: 10,
    warrantyMonths: 24,
    status: "active",
    image: "/products/headphones-detail.jpg",
    rating: 4.9,
    reviewCount: 128,
    updatedAt: "2026-09-01",
    en: {
      name: "CELIBERY X7 Pro",
      shortDescription: "Immersive sound. All-day freedom.",
      description: "The signature series. Adaptive noise cancellation, 40 hours of battery life, and a soft-earpad fit engineered for the way you move through your day.",
      features: ["Adaptive noise cancellation", "40 hours battery life", "Bluetooth 5.3", "IPX5 water resistant", "Foldable travel-friendly design"],
      seoTitle: "CELIBERY X7 Pro Wireless Headphones",
      seoDescription: "Shop the CELIBERY X7 Pro — adaptive ANC, 40H battery, Bluetooth 5.3. Free Saudi delivery.",
    },
    ar: {
      name: "سيليبري X7 برو",
      shortDescription: "صوت غامر. حرية طوال اليوم.",
      description: "السلسلة المميزة. إلغاء ضوضاء متكيف، وبطارية تدوم 40 ساعة، ووسائد أذن ناعمة مصممة لتلائم يومك.",
      features: ["إلغاء ضوضاء متكيف", "بطارية تدوم 40 ساعة", "بلوتوث 5.3", "مقاومة للماء IPX5", "تصميم قابل للطي مناسب للسفر"],
      seoTitle: "سماعات سيليبري X7 برو اللاسلكية",
      seoDescription: "تسوق سماعات سيليبري X7 برو — إلغاء ضوضاء متكيف، بطارية 40 ساعة، بلوتوث 5.3. توصيل مجاني.",
    },
  },
  {
    id: "x5-core",
    sku: "CEL-HP-X5CORE",
    category: "headphones",
    price: 349,
    salePrice: null,
    stock: 120,
    lowStockThreshold: 15,
    warrantyMonths: 24,
    status: "active",
    image: "/products/headphones-classic.jpg",
    rating: 4.8,
    reviewCount: 84,
    updatedAt: "2026-08-24",
    en: {
      name: "CELIBERY X5 Core",
      shortDescription: "Deep bass. Dependable everyday sound.",
      description: "A balanced, comfort-first fit with deep bass tuning and dependable battery life for daily listening.",
      features: ["Deep bass tuning", "32 hours battery life", "Bluetooth 5.3", "Comfort-fit cushions"],
      seoTitle: "CELIBERY X5 Core Wireless Headphones",
      seoDescription: "Everyday wireless headphones with deep bass tuning and 32H battery life.",
    },
    ar: {
      name: "سيليبري X5 كور",
      shortDescription: "باس عميق. صوت يومي موثوق.",
      description: "ملاءمة متوازنة تركز على الراحة مع ضبط باس عميق وبطارية موثوقة للاستماع اليومي.",
      features: ["ضبط باس عميق", "بطارية تدوم 32 ساعة", "بلوتوث 5.3", "وسائد مريحة"],
      seoTitle: "سماعات سيليبري X5 كور اللاسلكية",
      seoDescription: "سماعات لاسلكية يومية بضبط باس عميق وبطارية تدوم 32 ساعة.",
    },
  },
  {
    id: "air-one",
    sku: "CEL-EB-AIRONE",
    category: "earbuds",
    price: 299,
    salePrice: null,
    stock: 150,
    lowStockThreshold: 20,
    warrantyMonths: 12,
    status: "active",
    image: "/products/earbuds-case.jpg",
    rating: 4.8,
    reviewCount: 96,
    updatedAt: "2026-09-03",
    en: {
      name: "CELIBERY Air One",
      shortDescription: "Small form. Big sound.",
      description: "A pocket-sized true wireless listening experience with clear call microphones and all-day battery.",
      features: ["28 hours total battery", "Clear call microphones", "Bluetooth 5.3", "IPX5 water resistant"],
      seoTitle: "CELIBERY Air One True Wireless Earbuds",
      seoDescription: "True wireless earbuds with 28H total battery and IPX5 water resistance.",
    },
    ar: {
      name: "سيليبري إير ون",
      shortDescription: "حجم صغير. صوت كبير.",
      description: "تجربة استماع لاسلكية بالكامل بحجم الجيب مع ميكروفونات مكالمات واضحة وبطارية تدوم طوال اليوم.",
      features: ["بطارية إجمالية 28 ساعة", "ميكروفونات مكالمات واضحة", "بلوتوث 5.3", "مقاومة للماء IPX5"],
      seoTitle: "سماعات سيليبري إير ون اللاسلكية",
      seoDescription: "سماعات أذن لاسلكية بالكامل ببطارية إجمالية 28 ساعة ومقاومة للماء IPX5.",
    },
  },
  {
    id: "air-pro",
    sku: "CEL-EB-AIRPRO",
    category: "earbuds",
    price: 399,
    salePrice: null,
    stock: 96,
    lowStockThreshold: 15,
    warrantyMonths: 12,
    status: "active",
    image: "/products/earbuds-macro.jpg",
    rating: 4.9,
    reviewCount: 71,
    updatedAt: "2026-08-30",
    en: {
      name: "CELIBERY Air Pro",
      shortDescription: "Spatial audio. Adaptive silence.",
      description: "Spatial audio and adaptive noise control in a refined, pocket-ready silhouette.",
      features: ["32 hours total battery", "Spatial audio", "Adaptive noise cancellation", "IPX5 water resistant"],
      seoTitle: "CELIBERY Air Pro True Wireless Earbuds",
      seoDescription: "Spatial audio earbuds with adaptive ANC and 32H total battery.",
    },
    ar: {
      name: "سيليبري إير برو",
      shortDescription: "صوت مكاني. عزل ضوضاء متكيف.",
      description: "صوت مكاني وتحكم متكيف بالضوضاء في تصميم أنيق يناسب الجيب.",
      features: ["بطارية إجمالية 32 ساعة", "صوت مكاني", "إلغاء ضوضاء متكيف", "مقاومة للماء IPX5"],
      seoTitle: "سماعات سيليبري إير برو اللاسلكية",
      seoDescription: "سماعات صوت مكاني مع إلغاء ضوضاء متكيف وبطارية إجمالية 32 ساعة.",
    },
  },
  {
    id: "pulse-mini",
    sku: "CEL-SP-PULSEMINI",
    category: "speakers",
    price: 299,
    salePrice: 249,
    stock: 110,
    lowStockThreshold: 15,
    warrantyMonths: 12,
    status: "active",
    image: "/products/speaker-outdoor.jpg",
    rating: 4.7,
    reviewCount: 64,
    updatedAt: "2026-09-05",
    en: {
      name: "CELIBERY Pulse Mini",
      shortDescription: "Turn every moment into an experience.",
      description: "Room-filling 360-degree sound in a compact, waterproof speaker made to move with you.",
      features: ["12 hours playtime", "360-degree sound", "Bluetooth 5.3", "IPX7 waterproof"],
      seoTitle: "CELIBERY Pulse Mini Bluetooth Speaker",
      seoDescription: "Compact IPX7 waterproof speaker with 360-degree sound and 12H battery.",
    },
    ar: {
      name: "سيليبري بالس ميني",
      shortDescription: "حوّل كل لحظة إلى تجربة.",
      description: "صوت محيطي بزاوية 360 درجة في مكبر صوت مقاوم للماء ومضغوط يرافقك أينما ذهبت.",
      features: ["بطارية تدوم 12 ساعة", "صوت محيطي 360 درجة", "بلوتوث 5.3", "مقاومة للماء IPX7"],
      seoTitle: "مكبر صوت سيليبري بالس ميني",
      seoDescription: "مكبر صوت مقاوم للماء IPX7 بصوت محيطي 360 درجة وبطارية 12 ساعة.",
    },
  },
  {
    id: "pulse-max",
    sku: "CEL-SP-PULSEMAX",
    category: "speakers",
    price: 599,
    salePrice: null,
    stock: 60,
    lowStockThreshold: 10,
    warrantyMonths: 12,
    status: "active",
    image: "/products/speaker-rooftop.jpg",
    rating: 4.8,
    reviewCount: 52,
    updatedAt: "2026-08-18",
    en: {
      name: "CELIBERY Pulse Max",
      shortDescription: "Powerful bass, made for outdoors.",
      description: "Outdoor-ready protection, powerful bass, and a confident soundstage for bigger moments.",
      features: ["20 hours playtime", "Powerful bass", "Bluetooth 5.3", "IPX7 waterproof"],
      seoTitle: "CELIBERY Pulse Max Bluetooth Speaker",
      seoDescription: "Outdoor-ready IPX7 speaker with powerful bass and 20H battery.",
    },
    ar: {
      name: "سيليبري بالس ماكس",
      shortDescription: "باس قوي، مصمم للأجواء الخارجية.",
      description: "حماية مناسبة للأجواء الخارجية، وباس قوي، ومسرح صوتي واثق للحظات الأكبر.",
      features: ["بطارية تدوم 20 ساعة", "باس قوي", "بلوتوث 5.3", "مقاومة للماء IPX7"],
      seoTitle: "مكبر صوت سيليبري بالس ماكس",
      seoDescription: "مكبر صوت مقاوم للماء IPX7 بباس قوي وبطارية تدوم 20 ساعة.",
    },
  },
  {
    id: "braided-usb-c-cable",
    sku: "CEL-AC-CABLE01",
    category: "accessories",
    price: 49,
    salePrice: null,
    stock: 300,
    lowStockThreshold: 30,
    warrantyMonths: 12,
    status: "draft",
    image: "/products/earbuds-box.jpg",
    rating: 4.6,
    reviewCount: 21,
    updatedAt: "2026-09-06",
    en: {
      name: "CELIBERY Braided USB-C Cable",
      shortDescription: "Fast, durable charging for your gear.",
      description: "A reinforced braided cable built to keep your CELIBERY devices charged and ready.",
      features: ["1.2m braided cable", "Fast charging", "Reinforced connectors"],
      seoTitle: "CELIBERY Braided USB-C Cable",
      seoDescription: "1.2m braided USB-C cable with reinforced connectors.",
    },
    ar: { name: "", shortDescription: "", description: "", features: [], seoTitle: "", seoDescription: "" },
  },
  {
    id: "travel-case",
    sku: "CEL-AC-CASE01",
    category: "accessories",
    price: 89,
    salePrice: null,
    stock: 150,
    lowStockThreshold: 20,
    warrantyMonths: 12,
    status: "draft",
    image: "/products/earbuds-box.jpg",
    rating: 4.7,
    reviewCount: 18,
    updatedAt: "2026-09-06",
    en: {
      name: "CELIBERY Travel Case",
      shortDescription: "Protection for every journey.",
      description: "A compact hard-shell case that protects your headphones or earbuds on the move.",
      features: ["Hard-shell EVA protection", "Compact carry size", "Fits most CELIBERY headphones"],
      seoTitle: "CELIBERY Travel Case",
      seoDescription: "Hard-shell EVA travel case that fits most CELIBERY headphones.",
    },
    ar: { name: "حقيبة السفر من سيليبري", shortDescription: "حماية في كل رحلة.", description: "", features: [], seoTitle: "", seoDescription: "" },
  },
];

export const categoryOptions: { value: AdminCategory; en: string; ar: string }[] = [
  { value: "headphones", en: "Headphones", ar: "سماعات الرأس" },
  { value: "earbuds", en: "Earbuds", ar: "سماعات الأذن" },
  { value: "speakers", en: "Speakers", ar: "مكبرات الصوت" },
  { value: "accessories", en: "Accessories", ar: "الإكسسوارات" },
];
