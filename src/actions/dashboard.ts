"use server";

import { prisma } from "@/lib/db/prisma";
import { getAdminOrders, type AdminOrder } from "@/actions/orders";

export type DashboardStats = {
  todaysSales: number;
  revenue7d: number;
  revenueChangePct: number | null;
  orders7d: number;
  ordersChangePct: number | null;
  totalCustomers: number;
  productsSold7d: number;
  revenueSeries: { day: string; revenue: number; orders: number }[];
  salesByCity: { city: string; value: number }[];
  recentOrders: AdminOrder[];
  topProducts: { id: string; nameEn: string; nameAr: string; image: string; price: number; salePrice: number | null; sold: number }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const orders = await prisma.order.findMany({
    include: { items: true, address: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fourteenDaysAgo = new Date(sevenDaysAgo);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 7);

  const todaysSales = orders.filter((o) => o.createdAt >= startOfToday).reduce((sum, o) => sum + Number(o.total), 0);
  const last7 = orders.filter((o) => o.createdAt >= sevenDaysAgo);
  const prev7 = orders.filter((o) => o.createdAt >= fourteenDaysAgo && o.createdAt < sevenDaysAgo);

  const revenue7d = last7.reduce((sum, o) => sum + Number(o.total), 0);
  const prevRevenue7d = prev7.reduce((sum, o) => sum + Number(o.total), 0);
  const revenueChangePct = prevRevenue7d > 0 ? Math.round(((revenue7d - prevRevenue7d) / prevRevenue7d) * 100) : null;

  const orders7d = last7.length;
  const prevOrders7d = prev7.length;
  const ordersChangePct = prevOrders7d > 0 ? Math.round(((orders7d - prevOrders7d) / prevOrders7d) * 100) : null;

  const productsSold7d = last7.reduce((sum, o) => sum + o.items.reduce((s, item) => s + item.quantity, 0), 0);

  const revenueSeries = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfToday);
    day.setDate(day.getDate() - (6 - i));
    const key = day.toDateString();
    const dayOrders = orders.filter((o) => o.createdAt.toDateString() === key);
    return {
      day: day.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
      orders: dayOrders.length,
    };
  });

  const cityTotals = new Map<string, number>();
  for (const order of orders) {
    const city = order.address?.city;
    if (!city) continue;
    cityTotals.set(city, (cityTotals.get(city) ?? 0) + 1);
  }
  const salesByCity = [...cityTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([city, value]) => ({ city, value }));

  const productTotals = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      productTotals.set(item.productId, (productTotals.get(item.productId) ?? 0) + item.quantity);
    }
  }
  const topProductEntries = [...productTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topProductRows = topProductEntries.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: topProductEntries.map(([id]) => id) } },
        include: { translations: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      })
    : [];
  const topProducts = topProductEntries
    .map(([id, sold]) => {
      const product = topProductRows.find((p) => p.id === id);
      if (!product) return null;
      const en = product.translations.find((t) => t.locale === "en");
      const ar = product.translations.find((t) => t.locale === "ar");
      return {
        id: product.slug,
        nameEn: en?.name ?? product.slug,
        nameAr: ar?.name ?? "",
        image: product.images[0]?.url ?? "/products/headphones-classic.jpg",
        price: Number(product.price),
        salePrice: product.salePrice != null ? Number(product.salePrice) : null,
        sold,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const [totalCustomers, recentOrders] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    getAdminOrders().then((list) => list.slice(0, 5)),
  ]);

  return {
    todaysSales,
    revenue7d,
    revenueChangePct,
    orders7d,
    ordersChangePct,
    totalCustomers,
    productsSold7d,
    revenueSeries,
    salesByCity,
    recentOrders,
    topProducts,
  };
}
