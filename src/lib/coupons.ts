import { prisma } from "@/lib/db/prisma";

export type CouponValidationResult =
  | { valid: true; couponId: string; discount: number }
  | { valid: false; error: string };

/** Validates a coupon code against real Coupon data — active window, usage limits,
 * minimum order, and per-customer limit. Never invents a discount; an unknown or
 * ineligible code is rejected with a specific reason instead of silently ignored. */
export async function validateCoupon(rawCode: string, subtotal: number, customerEmail: string): Promise<CouponValidationResult> {
  const code = rawCode.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return { valid: false, error: "This coupon code is not valid." };
  if (!coupon.active) return { valid: false, error: "This coupon is no longer active." };

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) return { valid: false, error: "This coupon is not active yet." };
  if (coupon.expiresAt && now > coupon.expiresAt) return { valid: false, error: "This coupon has expired." };
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) return { valid: false, error: "This coupon has reached its usage limit." };

  const minimumOrder = coupon.minimumOrder != null ? Number(coupon.minimumOrder) : null;
  if (minimumOrder != null && subtotal < minimumOrder) return { valid: false, error: `This coupon requires a minimum order of SAR ${minimumOrder}.` };

  // Email may be unknown yet (e.g. previewing a code before the checkout form's email
  // field is filled in) — skip the per-customer check then; checkout re-validates with
  // the real email before the order is created, so this can't be bypassed.
  if (coupon.customerLimit != null && customerEmail) {
    const priorUses = await prisma.order.count({ where: { couponId: coupon.id, customerEmail: { equals: customerEmail, mode: "insensitive" } } });
    if (priorUses >= coupon.customerLimit) return { valid: false, error: "You've already used this coupon the maximum number of times." };
  }

  const rawDiscount = coupon.type === "PERCENTAGE" ? subtotal * (Number(coupon.value) / 100) : Number(coupon.value);
  const maximumDiscount = coupon.maximumDiscount != null ? Number(coupon.maximumDiscount) : null;
  const capped = maximumDiscount != null ? Math.min(rawDiscount, maximumDiscount) : rawDiscount;
  const discount = Math.min(Math.round(capped), subtotal);

  return { valid: true, couponId: coupon.id, discount };
}
