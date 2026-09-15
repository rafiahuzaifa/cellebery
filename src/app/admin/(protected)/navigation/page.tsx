import { getAdminNavItems } from "@/actions/navigation";
import { getAdminCategories } from "@/actions/categories";
import { NavigationManager } from "@/components/admin/navigation-manager";

export default async function AdminNavigationPage() {
  const [items, categoryOptions] = await Promise.all([getAdminNavItems(), getAdminCategories()]);
  return <NavigationManager items={items} categoryOptions={categoryOptions} />;
}
