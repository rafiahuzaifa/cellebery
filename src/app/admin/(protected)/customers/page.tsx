import { getAdminCustomers } from "@/actions/customers";
import { CustomersTable } from "@/components/admin/customers-table";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();
  return <CustomersTable customers={customers} />;
}
