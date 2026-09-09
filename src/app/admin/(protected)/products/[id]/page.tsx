import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminProductBySlug } from "@/actions/products";

export default async function EditAdminProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const product = await getAdminProductBySlug(id);

  if (!product) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
        <p className="text-sm text-white/50">Product not found.</p>
        <Link href="/admin/products" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#22d3ee]"><ArrowLeft size={13} /> Back to products</Link>
      </div>
    );
  }

  return <ProductForm initial={product} />;
}
