import { getAdminShippingZones } from "@/actions/shipping";
import { ShippingManager } from "@/components/admin/shipping-manager";

export default async function AdminShippingPage() {
  const zones = await getAdminShippingZones();
  return <ShippingManager zones={zones} />;
}
