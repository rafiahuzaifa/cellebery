"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import type { OrderStatus } from "@prisma/client";

export type AdminOrder = {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  city: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  itemCount: number;
};

export type AdminOrderDetail = AdminOrder & {
  customerPhone: string;
  subtotal: number;
  discount: number;
  shipping: number;
  currency: string;
  address: { street: string; city: string; region: string; district: string | null } | null;
  items: { id: string; name: string; sku: string; quantity: number; unitPrice: number }[];
  payment: { provider: string; status: string; providerPaymentId: string | null } | null;
  statusHistory: { status: OrderStatus; note: string | null; createdAt: string }[];
};

const ORDER_LIST_INCLUDE = {
  address: true,
  items: true,
  user: true,
} satisfies import("@prisma/client").Prisma.OrderInclude;

type OrderWithRelations = import("@prisma/client").Prisma.OrderGetPayload<{ include: typeof ORDER_LIST_INCLUDE }>;

function toAdminOrder(order: OrderWithRelations): AdminOrder {
  return {
    id: order.id,
    number: order.number,
    customerName: order.user?.name ?? order.address?.recipientName ?? order.customerEmail,
    customerEmail: order.customerEmail,
    city: order.address?.city ?? "",
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const orders = await prisma.order.findMany({
    include: ORDER_LIST_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(toAdminOrder);
}

export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      address: true,
      items: true,
      user: true,
      payment: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) return null;

  return {
    ...toAdminOrder(order),
    customerPhone: order.customerPhone,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    currency: order.currency,
    address: order.address ? { street: order.address.street, city: order.address.city, region: order.address.region, district: order.address.district } : null,
    items: order.items.map((item) => ({ id: item.id, name: item.name, sku: item.sku, quantity: item.quantity, unitPrice: Number(item.unitPrice) })),
    payment: order.payment ? { provider: order.payment.provider, status: order.payment.status, providerPaymentId: order.payment.providerPaymentId } : null,
    statusHistory: order.statusHistory.map((entry) => ({ status: entry.status, note: entry.note, createdAt: entry.createdAt.toISOString() })),
  };
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus): Promise<void> {
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderStatusHistory.create({ data: { orderId, status } }),
  ]);
  revalidatePath("/admin/orders");
}
