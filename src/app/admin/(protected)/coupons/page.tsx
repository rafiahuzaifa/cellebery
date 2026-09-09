import { getAdminCoupons } from "@/actions/coupons";
import { CouponsTable } from "@/components/admin/coupons-table";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();
  return <CouponsTable coupons={coupons} />;
}
