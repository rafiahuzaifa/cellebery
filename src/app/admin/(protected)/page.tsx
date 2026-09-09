import { getAdminProducts } from "@/actions/products";
import { getDashboardStats } from "@/actions/dashboard";
import { DashboardOverview } from "@/components/admin/dashboard-overview";

export default async function AdminDashboardPage() {
  const [products, stats] = await Promise.all([getAdminProducts(), getDashboardStats()]);
  return <DashboardOverview products={products} stats={stats} />;
}
