import { getCustomerAddresses } from "@/actions/account";
import { AccountAddresses } from "@/components/account/account-addresses";

export default async function AccountAddressesPage() {
  const addresses = await getCustomerAddresses();
  return <AccountAddresses addresses={addresses} />;
}
