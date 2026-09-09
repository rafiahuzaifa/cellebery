import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminCouponById } from "@/actions/coupons";
import { CouponForm } from "@/components/admin/coupon-form";

export default async function EditAdminCouponPage({ params }: PageProps<"/admin/coupons/[id]">) {
  const { id } = await params;
  const coupon = await getAdminCouponById(id);

  if (!coupon) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
        <p className="text-sm text-white/50">Coupon not found.</p>
        <Link href="/admin/coupons" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#22d3ee]"><ArrowLeft size={13} /> Back to coupons</Link>
      </div>
    );
  }

  return <CouponForm initial={coupon} />;
}
