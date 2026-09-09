import { getAdminProducts } from "@/actions/products";
import { ProductsTable } from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  return <ProductsTable products={products} />;
}
