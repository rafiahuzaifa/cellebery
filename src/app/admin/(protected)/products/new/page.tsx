import { ProductForm } from "@/components/admin/product-form";
import { getPublicCategoryOptions } from "@/actions/categories";

export default async function NewAdminProductPage() {
  const categoryOptions = await getPublicCategoryOptions();
  return <ProductForm categoryOptions={categoryOptions} />;
}
