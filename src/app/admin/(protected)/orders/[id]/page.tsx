import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminOrderById } from "@/actions/orders";
import { OrderDetail } from "@/components/admin/order-detail";

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
        <p className="text-sm text-white/50">Order not found.</p>
        <Link href="/admin/orders" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#22d3ee]"><ArrowLeft size={13} /> Back to orders</Link>
      </div>
    );
  }

  return <OrderDetail order={order} />;
}
