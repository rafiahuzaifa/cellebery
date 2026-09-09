import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { getCustomerOrders } from "@/actions/account";
import { AccountDashboard } from "@/components/account/account-dashboard";

export default async function AccountDashboardPage({ params }: PageProps<"/[locale]/account">) {
  const { locale } = await params;
  const session = await auth();
  const [user, orders] = await Promise.all([
    session?.user.id ? prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, phone: true } }) : null,
    getCustomerOrders(),
  ]);
  return <AccountDashboard name={user?.name ?? ""} phone={user?.phone ?? ""} recentOrders={orders} locale={locale} />;
}
