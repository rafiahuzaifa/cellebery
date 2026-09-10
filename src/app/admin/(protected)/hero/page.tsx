import { getAdminHeroCampaigns, getHeroProductOptions } from "@/actions/hero-campaigns";
import { HeroCampaignsManager } from "@/components/admin/hero-campaigns-manager";

export default async function AdminHeroPage() {
  const [campaigns, productOptions] = await Promise.all([getAdminHeroCampaigns(), getHeroProductOptions()]);
  return <HeroCampaignsManager campaigns={campaigns} productOptions={productOptions} />;
}
