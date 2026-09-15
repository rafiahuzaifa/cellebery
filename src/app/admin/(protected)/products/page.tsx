import { getAdminProducts } from "@/actions/products";
import { getPublicCategoryOptions } from "@/actions/categories";
import { ProductsTable } from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  const [products, categoryOptions] = await Promise.all([getAdminProducts(), getPublicCategoryOptions()]);
  return <ProductsTable products={products} categoryOptions={categoryOptions} />;
}
