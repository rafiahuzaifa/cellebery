export const revenueSeries = [
  { day: "Sat", revenue: 12400, orders: 18 },
  { day: "Sun", revenue: 15800, orders: 22 },
  { day: "Mon", revenue: 11200, orders: 15 },
  { day: "Tue", revenue: 19600, orders: 27 },
  { day: "Wed", revenue: 23100, orders: 31 },
  { day: "Thu", revenue: 27400, orders: 36 },
  { day: "Fri", revenue: 24900, orders: 33 },
];

export const salesByCity = [
  { city: "Riyadh", cityAr: "الرياض", value: 42 },
  { city: "Jeddah", cityAr: "جدة", value: 27 },
  { city: "Dammam", cityAr: "الدمام", value: 14 },
  { city: "Khobar", cityAr: "الخبر", value: 9 },
  { city: "Other", cityAr: "أخرى", value: 8 },
];

export type RecentOrder = {
  id: string;
  customer: string;
  city: string;
  total: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
};

export const recentOrders: RecentOrder[] = [
  { id: "CEL-10482", customer: "Faisal Al-Otaibi", city: "Riyadh", total: 748, status: "Confirmed", createdAt: "2026-09-09 10:12" },
  { id: "CEL-10481", customer: "Noura Al-Harbi", city: "Jeddah", total: 299, status: "Pending", createdAt: "2026-09-09 09:45" },
  { id: "CEL-10480", customer: "Abdulaziz Al-Qahtani", city: "Dammam", total: 1198, status: "Shipped", createdAt: "2026-09-08 21:20" },
  { id: "CEL-10479", customer: "Sara Al-Ghamdi", city: "Khobar", total: 499, status: "Delivered", createdAt: "2026-09-08 17:03" },
  { id: "CEL-10478", customer: "Khalid Al-Dossary", city: "Riyadh", total: 349, status: "Cancelled", createdAt: "2026-09-08 14:51" },
];
