"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type AdminShippingMethod = {
  id: string;
  zoneId: string;
  name: string;
  nameAr: string;
  price: number;
  freeThreshold: number | null;
  minDays: number;
  maxDays: number;
  active: boolean;
};

export type AdminShippingZone = {
  id: string;
  name: string;
  regions: string[];
  active: boolean;
  methods: AdminShippingMethod[];
};

export async function getAdminShippingZones(): Promise<AdminShippingZone[]> {
  const zones = await prisma.shippingZone.findMany({ include: { methods: true }, orderBy: { name: "asc" } });
  return zones.map((zone) => ({
    id: zone.id,
    name: zone.name,
    regions: zone.regions,
    active: zone.active,
    methods: zone.methods.map((method) => ({
      id: method.id,
      zoneId: method.zoneId,
      name: method.name,
      nameAr: method.nameAr,
      price: Number(method.price),
      freeThreshold: method.freeThreshold != null ? Number(method.freeThreshold) : null,
      minDays: method.minDays,
      maxDays: method.maxDays,
      active: method.active,
    })),
  }));
}

function revalidateShipping() {
  revalidatePath("/admin/shipping");
}

export async function upsertShippingZoneAction(input: { id: string; name: string; regions: string[]; active: boolean }): Promise<{ error?: string }> {
  if (!input.name.trim()) return { error: "Zone name is required." };
  const data = { name: input.name.trim(), regions: input.regions, active: input.active };
  if (input.id) {
    await prisma.shippingZone.update({ where: { id: input.id }, data });
  } else {
    await prisma.shippingZone.create({ data });
  }
  revalidateShipping();
  return {};
}

export async function deleteShippingZoneAction(id: string) {
  await prisma.shippingZone.delete({ where: { id } });
  revalidateShipping();
}

export async function upsertShippingMethodAction(input: AdminShippingMethod): Promise<{ error?: string }> {
  if (!input.name.trim() || !input.nameAr.trim()) return { error: "Method name (EN and AR) is required." };
  if (input.price < 0) return { error: "Price can't be negative." };
  if (input.minDays < 0 || input.maxDays < input.minDays) return { error: "Delivery days range is invalid." };

  const data = {
    zoneId: input.zoneId,
    name: input.name.trim(),
    nameAr: input.nameAr.trim(),
    price: input.price,
    freeThreshold: input.freeThreshold,
    minDays: input.minDays,
    maxDays: input.maxDays,
    active: input.active,
  };

  if (input.id) {
    await prisma.shippingMethod.update({ where: { id: input.id }, data });
  } else {
    await prisma.shippingMethod.create({ data });
  }
  revalidateShipping();
  return {};
}

export async function deleteShippingMethodAction(id: string) {
  await prisma.shippingMethod.delete({ where: { id } });
  revalidateShipping();
}
