import { getAdminCategories } from "@/actions/categories";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoriesManager categories={categories} />;
}
