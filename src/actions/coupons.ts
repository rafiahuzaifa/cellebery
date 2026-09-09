"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import type { Coupon, DiscountType } from "@prisma/client";

export type AdminCouponType = "percentage" | "fixed";

export type AdminCoupon = {
  id: string;
  code: string;
  type: AdminCouponType;
  value: number;
  minimumOrder: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  customerLimit: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
};

const TYPE_TO_DB: Record<AdminCouponType, DiscountType> = { percentage: "PERCENTAGE", fixed: "FIXED" };
const TYPE_FROM_DB: Record<DiscountType, AdminCouponType> = { PERCENTAGE: "percentage", FIXED: "fixed" };

function toAdminCoupon(row: Coupon): AdminCoupon {
  return {
    id: row.id,
    code: row.code,
    type: TYPE_FROM_DB[row.type],
    value: Number(row.value),
    minimumOrder: row.minimumOrder != null ? Number(row.minimumOrder) : null,
    maximumDiscount: row.maximumDiscount != null ? Number(row.maximumDiscount) : null,
    usageLimit: row.usageLimit,
    usageCount: row.usageCount,
    customerLimit: row.customerLimit,
    startsAt: row.startsAt ? row.startsAt.toISOString().slice(0, 10) : null,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString().slice(0, 10) : null,
    active: row.active,
  };
}

export async function getAdminCoupons(): Promise<AdminCoupon[]> {
  const rows = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
  return rows.map(toAdminCoupon);
}

export async function getAdminCouponById(id: string): Promise<AdminCoupon | null> {
  const row = await prisma.coupon.findUnique({ where: { id } });
  return row ? toAdminCoupon(row) : null;
}

function revalidateCoupons() {
  revalidatePath("/admin/coupons");
}

export async function upsertAdminCouponAction(input: AdminCoupon): Promise<{ error?: string }> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { error: "Coupon code is required." };
  if (input.value <= 0) return { error: "Discount value must be greater than zero." };
  if (input.type === "percentage" && input.value > 100) return { error: "Percentage discount can't exceed 100." };

  const data = {
    code,
    type: TYPE_TO_DB[input.type],
    value: input.value,
    minimumOrder: input.minimumOrder,
    maximumDiscount: input.maximumDiscount,
    usageLimit: input.usageLimit,
    customerLimit: input.customerLimit,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    active: input.active,
  };

  try {
    if (input.id) {
      await prisma.coupon.update({ where: { id: input.id }, data });
    } else {
      await prisma.coupon.create({ data });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A coupon with that code already exists." };
    }
    throw error;
  }

  revalidateCoupons();
  return {};
}

export async function deleteAdminCouponAction(id: string) {
  await prisma.coupon.delete({ where: { id } });
  revalidateCoupons();
}

export async function toggleAdminCouponStatusAction(id: string) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return;
  await prisma.coupon.update({ where: { id }, data: { active: !coupon.active } });
  revalidateCoupons();
}
