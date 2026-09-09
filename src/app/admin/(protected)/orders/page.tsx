import { getAdminOrders } from "@/actions/orders";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  return <OrdersTable orders={orders} />;
}
