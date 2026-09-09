import { getDashboardStats } from "@/actions/dashboard";
import { AnalyticsOverview } from "@/components/admin/analytics-overview";

export default async function AdminAnalyticsPage() {
  const stats = await getDashboardStats();
  return <AnalyticsOverview stats={stats} />;
}
