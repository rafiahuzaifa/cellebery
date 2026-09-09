import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminCustomerById } from "@/actions/customers";
import { CustomerDetail } from "@/components/admin/customer-detail";

export default async function AdminCustomerDetailPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const customer = await getAdminCustomerById(id);

  if (!customer) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
        <p className="text-sm text-white/50">Customer not found.</p>
        <Link href="/admin/customers" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#22d3ee]"><ArrowLeft size={13} /> Back to customers</Link>
      </div>
    );
  }

  return <CustomerDetail customer={customer} />;
}
