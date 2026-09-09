import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCustomerOrderById } from "@/actions/account";
import { AccountOrderDetail } from "@/components/account/account-order-detail";

export default async function AccountOrderDetailPage({ params }: PageProps<"/[locale]/account/orders/[id]">) {
  const { locale, id } = await params;
  const order = await getCustomerOrderById(id);

  if (!order) {
    return (
      <div className="border border-white/10 bg-[#101416] px-6 py-16 text-center">
        <p className="text-sm text-white/50">Order not found.</p>
        <Link href={`/${locale}/account/orders`} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#22d3ee]"><ArrowLeft size={13} /> Back to orders</Link>
      </div>
    );
  }

  return <AccountOrderDetail order={order} locale={locale} />;
}
