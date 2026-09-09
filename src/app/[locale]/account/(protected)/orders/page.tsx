import { getCustomerOrders } from "@/actions/account";
import { AccountOrdersList } from "@/components/account/account-orders-list";

export default async function AccountOrdersPage({ params }: PageProps<"/[locale]/account/orders">) {
  const { locale } = await params;
  const orders = await getCustomerOrders();
  return <AccountOrdersList orders={orders} locale={locale} />;
}
