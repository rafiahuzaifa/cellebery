import { PrismaClient, ProductStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type CategorySeed = {
  slug: string;
  imageUrl: string;
  sortOrder: number;
  en: { name: string; description: string };
  ar: { name: string; description: string };
};

const categories: CategorySeed[] = [
  {
    slug: "headphones",
    imageUrl: "/products/headphones-classic.jpg",
    sortOrder: 1,
    en: { name: "Headphones", description: "Immersive over-ear sound, engineered for all-day comfort." },
    ar: { name: "سماعات الرأس", description: "صوت غامر فوق الأذن، مصمم لراحة طوال اليوم." },
  },
  {
    slug: "earbuds",
    imageUrl: "/products/earbuds-case.jpg",
    sortOrder: 2,
    en: { name: "Earbuds", description: "True wireless earbuds in a pocket-ready form." },
    ar: { name: "سماعات الأذن", description: "سماعات لاسلكية بالكامل بتصميم يناسب جيبك." },
  },
  {
    slug: "speakers",
    imageUrl: "/products/speaker-hero.jpg",
    sortOrder: 3,
    en: { name: "Speakers", description: "Portable Bluetooth speakers built for every moment." },
    ar: { name: "مكبرات الصوت", description: "مكبرات صوت بلوتوث محمولة مصممة لكل لحظة." },
  },
  {
    slug: "accessories",
    imageUrl: "/products/earbuds-box.jpg",
    sortOrder: 4,
    en: { name: "Accessories", description: "Cables, cases, and essentials for your CELIBERY gear." },
    ar: { name: "الإكسسوارات", description: "كابلات وحقائب وأساسيات لأجهزة CELIBERY الخاصة بك." },
  },
];

type ProductSeed = {
  slug: string;
  sku: string;
  categorySlug: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  warrantyMonths: number;
  stock: number;
  lowStockThreshold: number;
  images: { url: string; alt: string; sortOrder: number }[];
  specs: { key: string; value: string }[];
  en: { name: string; shortDescription: string; description: string; features: string[] };
  ar: { name: string; shortDescription: string; description: string; features: string[] };
};

const products: ProductSeed[] = [
  {
    slug: "x7-pro",
    sku: "CEL-HP-X7PRO",
    categorySlug: "headphones",
    price: 699,
    salePrice: 499,
    rating: 4.9,
    reviewCount: 128,
    warrantyMonths: 24,
    stock: 84,
    lowStockThreshold: 10,
    images: [
      { url: "/products/headphones-detail.jpg", alt: "CELIBERY X7 Pro headphones, front angle", sortOrder: 1 },
      { url: "/products/x7-pro-hero.jpg", alt: "CELIBERY X7 Pro on wet rock, cinematic", sortOrder: 2 },
      { url: "/products/headphones-classic.jpg", alt: "CELIBERY X7 Pro editorial studio shot", sortOrder: 3 },
      { url: "/products/headphones-earpad-macro.jpg", alt: "CELIBERY X7 Pro earpad close-up", sortOrder: 4 },
    ],
    specs: [
      { key: "battery", value: "40 hours" },
      { key: "bluetooth", value: "5.3" },
      { key: "anc", value: "Adaptive" },
      { key: "water_resistance", value: "IPX5" },
      { key: "driver_size", value: "40mm" },
    ],
    en: {
      name: "CELIBERY X7 Pro",
      shortDescription: "Immersive sound. All-day freedom.",
      description: "The signature series. Adaptive noise cancellation, 40 hours of battery life, and a soft-earpad fit engineered for the way you move through your day.",
      features: ["Adaptive noise cancellation", "40 hours battery life", "Bluetooth 5.3", "IPX5 water resistant", "Foldable travel-friendly design"],
    },
    ar: {
      name: "سيليبري X7 برو",
      shortDescription: "صوت غامر. حرية طوال اليوم.",
      description: "السلسلة المميزة. إلغاء ضوضاء متكيف، وبطارية تدوم 40 ساعة، ووسائد أذن ناعمة مصممة لتلائم يومك.",
      features: ["إلغاء ضوضاء متكيف", "بطارية تدوم 40 ساعة", "بلوتوث 5.3", "مقاومة للماء IPX5", "تصميم قابل للطي مناسب للسفر"],
    },
  },
  {
    slug: "x5-core",
    sku: "CEL-HP-X5CORE",
    categorySlug: "headphones",
    price: 349,
    rating: 4.8,
    reviewCount: 84,
    warrantyMonths: 24,
    stock: 120,
    lowStockThreshold: 15,
    images: [
      { url: "/products/headphones-classic.jpg", alt: "CELIBERY X5 Core headphones on stand", sortOrder: 1 },
      { url: "/products/headphones-detail.jpg", alt: "CELIBERY X5 Core front view", sortOrder: 2 },
    ],
    specs: [
      { key: "battery", value: "32 hours" },
      { key: "bluetooth", value: "5.3" },
      { key: "anc", value: "None" },
      { key: "water_resistance", value: "IPX4" },
      { key: "driver_size", value: "40mm" },
    ],
    en: {
      name: "CELIBERY X5 Core",
      shortDescription: "Deep bass. Dependable everyday sound.",
      description: "A balanced, comfort-first fit with deep bass tuning and dependable battery life for daily listening.",
      features: ["Deep bass tuning", "32 hours battery life", "Bluetooth 5.3", "Comfort-fit cushions"],
    },
    ar: {
      name: "سيليبري X5 كور",
      shortDescription: "باس عميق. صوت يومي موثوق.",
      description: "ملاءمة متوازنة تركز على الراحة مع ضبط باس عميق وبطارية موثوقة للاستماع اليومي.",
      features: ["ضبط باس عميق", "بطارية تدوم 32 ساعة", "بلوتوث 5.3", "وسائد مريحة"],
    },
  },
  {
    slug: "air-one",
    sku: "CEL-EB-AIRONE",
    categorySlug: "earbuds",
    price: 299,
    rating: 4.8,
    reviewCount: 96,
    warrantyMonths: 12,
    stock: 150,
    lowStockThreshold: 20,
    images: [
      { url: "/products/earbuds-case.jpg", alt: "CELIBERY Air One earbuds and case", sortOrder: 1 },
      { url: "/products/earbuds-hero.jpg", alt: "CELIBERY Air One earbuds close-up", sortOrder: 2 },
      { url: "/products/earbuds-box.jpg", alt: "CELIBERY Air One retail packaging", sortOrder: 3 },
    ],
    specs: [
      { key: "battery", value: "28 hours total" },
      { key: "bluetooth", value: "5.3" },
      { key: "anc", value: "None" },
      { key: "water_resistance", value: "IPX5" },
      { key: "driver_size", value: "10mm" },
    ],
    en: {
      name: "CELIBERY Air One",
      shortDescription: "Small form. Big sound.",
      description: "A pocket-sized true wireless listening experience with clear call microphones and all-day battery.",
      features: ["28 hours total battery", "Clear call microphones", "Bluetooth 5.3", "IPX5 water resistant"],
    },
    ar: {
      name: "سيليبري إير ون",
      shortDescription: "حجم صغير. صوت كبير.",
      description: "تجربة استماع لاسلكية بالكامل بحجم الجيب مع ميكروفونات مكالمات واضحة وبطارية تدوم طوال اليوم.",
      features: ["بطارية إجمالية 28 ساعة", "ميكروفونات مكالمات واضحة", "بلوتوث 5.3", "مقاومة للماء IPX5"],
    },
  },
  {
    slug: "air-pro",
    sku: "CEL-EB-AIRPRO",
    categorySlug: "earbuds",
    price: 399,
    rating: 4.9,
    reviewCount: 71,
    warrantyMonths: 12,
    stock: 96,
    lowStockThreshold: 15,
    images: [
      { url: "/products/earbuds-macro.jpg", alt: "CELIBERY Air Pro earbud macro with water droplets", sortOrder: 1 },
      { url: "/products/earbuds-hero.jpg", alt: "CELIBERY Air Pro earbuds and case", sortOrder: 2 },
    ],
    specs: [
      { key: "battery", value: "32 hours total" },
      { key: "bluetooth", value: "5.3" },
      { key: "anc", value: "Adaptive" },
      { key: "water_resistance", value: "IPX5" },
      { key: "driver_size", value: "11mm" },
    ],
    en: {
      name: "CELIBERY Air Pro",
      shortDescription: "Spatial audio. Adaptive silence.",
      description: "Spatial audio and adaptive noise control in a refined, pocket-ready silhouette.",
      features: ["32 hours total battery", "Spatial audio", "Adaptive noise cancellation", "IPX5 water resistant"],
    },
    ar: {
      name: "سيليبري إير برو",
      shortDescription: "صوت مكاني. عزل ضوضاء متكيف.",
      description: "صوت مكاني وتحكم متكيف بالضوضاء في تصميم أنيق يناسب الجيب.",
      features: ["بطارية إجمالية 32 ساعة", "صوت مكاني", "إلغاء ضوضاء متكيف", "مقاومة للماء IPX5"],
    },
  },
  {
    slug: "pulse-mini",
    sku: "CEL-SP-PULSEMINI",
    categorySlug: "speakers",
    price: 299,
    salePrice: 249,
    rating: 4.7,
    reviewCount: 64,
    warrantyMonths: 12,
    stock: 110,
    lowStockThreshold: 15,
    images: [
      { url: "/products/speaker-outdoor.jpg", alt: "CELIBERY Pulse Mini speaker on wet rock", sortOrder: 1 },
      { url: "/products/speaker-hero.jpg", alt: "CELIBERY Pulse Mini close-up with water splash", sortOrder: 2 },
    ],
    specs: [
      { key: "battery", value: "12 hours" },
      { key: "bluetooth", value: "5.3" },
      { key: "water_resistance", value: "IPX7" },
      { key: "connectivity", value: "360-degree sound" },
    ],
    en: {
      name: "CELIBERY Pulse Mini",
      shortDescription: "Turn every moment into an experience.",
      description: "Room-filling 360-degree sound in a compact, waterproof speaker made to move with you.",
      features: ["12 hours playtime", "360-degree sound", "Bluetooth 5.3", "IPX7 waterproof"],
    },
    ar: {
      name: "سيليبري بالس ميني",
      shortDescription: "حوّل كل لحظة إلى تجربة.",
      description: "صوت محيطي بزاوية 360 درجة في مكبر صوت مقاوم للماء ومضغوط يرافقك أينما ذهبت.",
      features: ["بطارية تدوم 12 ساعة", "صوت محيطي 360 درجة", "بلوتوث 5.3", "مقاومة للماء IPX7"],
    },
  },
  {
    slug: "pulse-max",
    sku: "CEL-SP-PULSEMAX",
    categorySlug: "speakers",
    price: 599,
    rating: 4.8,
    reviewCount: 52,
    warrantyMonths: 12,
    stock: 60,
    lowStockThreshold: 10,
    images: [
      { url: "/products/speaker-rooftop.jpg", alt: "CELIBERY Pulse Max on rooftop table at dusk", sortOrder: 1 },
      { url: "/products/speaker-hero.jpg", alt: "CELIBERY Pulse Max close-up", sortOrder: 2 },
    ],
    specs: [
      { key: "battery", value: "20 hours" },
      { key: "bluetooth", value: "5.3" },
      { key: "water_resistance", value: "IPX7" },
      { key: "connectivity", value: "Powerful bass" },
    ],
    en: {
      name: "CELIBERY Pulse Max",
      shortDescription: "Powerful bass, made for outdoors.",
      description: "Outdoor-ready protection, powerful bass, and a confident soundstage for bigger moments.",
      features: ["20 hours playtime", "Powerful bass", "Bluetooth 5.3", "IPX7 waterproof"],
    },
    ar: {
      name: "سيليبري بالس ماكس",
      shortDescription: "باس قوي، مصمم للأجواء الخارجية.",
      description: "حماية مناسبة للأجواء الخارجية، وباس قوي، ومسرح صوتي واثق للحظات الأكبر.",
      features: ["بطارية تدوم 20 ساعة", "باس قوي", "بلوتوث 5.3", "مقاومة للماء IPX7"],
    },
  },
  {
    slug: "braided-usb-c-cable",
    sku: "CEL-AC-CABLE01",
    categorySlug: "accessories",
    price: 49,
    rating: 4.6,
    reviewCount: 21,
    warrantyMonths: 12,
    stock: 300,
    lowStockThreshold: 30,
    images: [
      { url: "/products/earbuds-box.jpg", alt: "CELIBERY braided USB-C charging cable", sortOrder: 1 },
    ],
    specs: [
      { key: "length", value: "1.2m" },
      { key: "connector", value: "USB-C to USB-C" },
    ],
    en: {
      name: "CELIBERY Braided USB-C Cable",
      shortDescription: "Fast, durable charging for your gear.",
      description: "A reinforced braided cable built to keep your CELIBERY devices charged and ready.",
      features: ["1.2m braided cable", "Fast charging", "Reinforced connectors"],
    },
    ar: {
      name: "كابل USB-C مضفر من سيليبري",
      shortDescription: "شحن سريع ومتين لأجهزتك.",
      description: "كابل مضفر معزز مصمم لإبقاء أجهزة CELIBERY مشحونة وجاهزة دائماً.",
      features: ["كابل مضفر بطول 1.2 متر", "شحن سريع", "موصلات معززة"],
    },
  },
  {
    slug: "travel-case",
    sku: "CEL-AC-CASE01",
    categorySlug: "accessories",
    price: 89,
    rating: 4.7,
    reviewCount: 18,
    warrantyMonths: 12,
    stock: 150,
    lowStockThreshold: 20,
    images: [
      { url: "/products/earbuds-box.jpg", alt: "CELIBERY hard-shell travel case", sortOrder: 1 },
    ],
    specs: [
      { key: "material", value: "Hard-shell EVA" },
      { key: "fits", value: "Headphones and earbuds" },
    ],
    en: {
      name: "CELIBERY Travel Case",
      shortDescription: "Protection for every journey.",
      description: "A compact hard-shell case that protects your headphones or earbuds on the move.",
      features: ["Hard-shell EVA protection", "Compact carry size", "Fits most CELIBERY headphones"],
    },
    ar: {
      name: "حقيبة السفر من سيليبري",
      shortDescription: "حماية في كل رحلة.",
      description: "حقيبة صلبة مدمجة تحمي سماعاتك أو سماعات الأذن أثناء التنقل.",
      features: ["حماية صلبة من مادة EVA", "حجم مدمج للحمل", "تناسب معظم سماعات سيليبري"],
    },
  },
];

async function main() {
  console.log("Seeding CELIBERY catalog...");

  const categoryIdBySlug = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { imageUrl: category.imageUrl, sortOrder: category.sortOrder },
      create: { slug: category.slug, imageUrl: category.imageUrl, sortOrder: category.sortOrder },
    });
    categoryIdBySlug.set(category.slug, record.id);

    for (const [locale, translation] of [["en", category.en], ["ar", category.ar]] as const) {
      await prisma.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: record.id, locale } },
        update: { name: translation.name, description: translation.description },
        create: { categoryId: record.id, locale, name: translation.name, description: translation.description },
      });
    }
  }

  for (const product of products) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) throw new Error(`Unknown category slug: ${product.categorySlug}`);

    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        sku: product.sku,
        status: ProductStatus.ACTIVE,
        price: product.price,
        salePrice: product.salePrice ?? null,
        rating: product.rating,
        reviewCount: product.reviewCount,
        warrantyMonths: product.warrantyMonths,
        categoryId,
        publishedAt: new Date(),
      },
      create: {
        slug: product.slug,
        sku: product.sku,
        status: ProductStatus.ACTIVE,
        price: product.price,
        salePrice: product.salePrice ?? null,
        rating: product.rating,
        reviewCount: product.reviewCount,
        warrantyMonths: product.warrantyMonths,
        categoryId,
        publishedAt: new Date(),
      },
    });

    for (const [locale, translation] of [["en", product.en], ["ar", product.ar]] as const) {
      await prisma.productTranslation.upsert({
        where: { productId_locale: { productId: record.id, locale } },
        update: {
          name: translation.name,
          shortDescription: translation.shortDescription,
          description: translation.description,
          features: translation.features,
        },
        create: {
          productId: record.id,
          locale,
          name: translation.name,
          shortDescription: translation.shortDescription,
          description: translation.description,
          features: translation.features,
        },
      });
    }

    await prisma.productImage.deleteMany({ where: { productId: record.id } });
    await prisma.productImage.createMany({
      data: product.images.map((image) => ({ productId: record.id, url: image.url, alt: image.alt, sortOrder: image.sortOrder })),
    });

    await prisma.productSpecification.deleteMany({ where: { productId: record.id } });
    await prisma.productSpecification.createMany({
      data: product.specs.map((spec) => ({ productId: record.id, key: spec.key, value: spec.value, locale: "en" })),
    });

    await prisma.inventory.upsert({
      where: { productId: record.id },
      update: { stock: product.stock, lowStockThreshold: product.lowStockThreshold },
      create: { productId: record.id, stock: product.stock, lowStockThreshold: product.lowStockThreshold },
    });
  }

  const saudiZone = await prisma.shippingZone.upsert({
    where: { id: "saudi-arabia" },
    update: { name: "Saudi Arabia", regions: ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Taif"], active: true },
    create: { id: "saudi-arabia", name: "Saudi Arabia", regions: ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Taif"], active: true },
  });

  const shippingMethods = [
    { id: "standard-delivery", name: "Standard Delivery", nameAr: "توصيل عادي", price: 25, freeThreshold: 399, minDays: 2, maxDays: 5 },
    { id: "express-delivery", name: "Express Delivery", nameAr: "توصيل سريع", price: 60, freeThreshold: null, minDays: 1, maxDays: 2 },
  ];

  for (const method of shippingMethods) {
    await prisma.shippingMethod.upsert({
      where: { id: method.id },
      update: { ...method, zoneId: saudiZone.id },
      create: { ...method, zoneId: saudiZone.id },
    });
  }

  console.log(`Seeded ${categories.length} categories, ${products.length} products, 1 shipping zone.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
