"use server";

import { prisma } from "@/lib/db/prisma";

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  orderCount: number;
  lifetimeValue: number;
};

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { total: true } } },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name ?? "",
    email: user.email,
    phone: user.phone ?? "",
    createdAt: user.createdAt.toISOString(),
    orderCount: user.orders.length,
    lifetimeValue: user.orders.reduce((sum, order) => sum + Number(order.total), 0),
  }));
}

export type AdminCustomerDetail = AdminCustomer & {
  orders: { id: string; number: string; status: string; total: number; createdAt: string }[];
  addresses: { id: string; label: string; recipientName: string; city: string; region: string; street: string; isDefault: boolean }[];
};

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, select: { id: true, number: true, status: true, total: true, createdAt: true } },
      addresses: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!user || user.role !== "CUSTOMER") return null;

  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email,
    phone: user.phone ?? "",
    createdAt: user.createdAt.toISOString(),
    orderCount: user.orders.length,
    lifetimeValue: user.orders.reduce((sum, order) => sum + Number(order.total), 0),
    orders: user.orders.map((order) => ({ id: order.id, number: order.number, status: order.status, total: Number(order.total), createdAt: order.createdAt.toISOString() })),
    addresses: user.addresses.map((a) => ({ id: a.id, label: a.label ?? "", recipientName: a.recipientName, city: a.city, region: a.region, street: a.street, isDefault: a.isDefault })),
  };
}
