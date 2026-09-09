"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth, signIn } from "@/lib/auth/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export type AccountFormState = { error?: string } | undefined;

/** Registers a new customer, or upgrades an existing passwordless guest User row (created
 * by a prior checkout) into a real account — this is what makes that guest's past orders
 * show up in their new account, since Order.userId already points at that same row.
 * Never overwrites a password that's already set (guest rows only) — see the plan's
 * security note: this is the only thing preventing someone from "registering" over an
 * existing staff or customer account to hijack it. */
export async function registerCustomerAction(_prevState: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (name.length < 2) return { error: "Please enter your full name." };
  if (!/.+@.+\..+/.test(email)) return { error: "Please enter a valid email address." };
  if (phone.length < 8) return { error: "Please enter a valid mobile number." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return { error: "An account with this email already exists. Please sign in instead." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { passwordHash, name, phone } });
  } else {
    await prisma.user.create({ data: { email, name, phone, passwordHash, role: "CUSTOMER" } });
  }

  try {
    await signIn("credentials", { email, password, redirectTo: `/${locale}/account` });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Account created, but sign-in failed. Please sign in manually." };
    throw error;
  }
  return undefined;
}

/** These actions are only ever called from pages under the (protected) account layout,
 * which already redirects to the (locale-aware) login page if there's no session — so a
 * missing session here means this was reached some other way, and throwing (not
 * redirecting, which would need locale context this function doesn't have) is correct. */
async function requireCustomerSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  return session;
}

export type CustomerOrder = {
  id: string;
  number: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  itemCount: number;
};

export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  const session = await requireCustomerSession();
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map((order) => ({
    id: order.id,
    number: order.number,
    status: order.status,
    total: Number(order.total),
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));
}

export type CustomerOrderDetail = CustomerOrder & {
  subtotal: number;
  discount: number;
  shipping: number;
  items: { name: string; sku: string; quantity: number; unitPrice: number }[];
  address: { street: string; city: string; region: string } | null;
  statusHistory: { status: string; createdAt: string }[];
};

/** Returns null (never someone else's order) if the order doesn't belong to the caller —
 * the same ownership discipline used everywhere else in this app (chatbot guest order
 * lookup verifies email match; this is the authenticated equivalent). */
export async function getCustomerOrderById(id: string): Promise<CustomerOrderDetail | null> {
  const session = await requireCustomerSession();
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, address: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });
  if (!order || order.userId !== session.user.id) return null;

  return {
    id: order.id,
    number: order.number,
    status: order.status,
    total: Number(order.total),
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    items: order.items.map((item) => ({ name: item.name, sku: item.sku, quantity: item.quantity, unitPrice: Number(item.unitPrice) })),
    address: order.address ? { street: order.address.street, city: order.address.city, region: order.address.region } : null,
    statusHistory: order.statusHistory.map((entry) => ({ status: entry.status, createdAt: entry.createdAt.toISOString() })),
  };
}

export type CustomerAddress = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  region: string;
  city: string;
  street: string;
  isDefault: boolean;
};

export async function getCustomerAddresses(): Promise<CustomerAddress[]> {
  const session = await requireCustomerSession();
  const addresses = await prisma.address.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
  return addresses.map((a) => ({ id: a.id, label: a.label ?? "", recipientName: a.recipientName, phone: a.phone, region: a.region, city: a.city, street: a.street, isDefault: a.isDefault }));
}

export async function upsertCustomerAddressAction(input: CustomerAddress): Promise<{ error?: string }> {
  const session = await requireCustomerSession();
  if (!input.recipientName.trim() || !input.phone.trim() || !input.street.trim() || !input.city.trim()) {
    return { error: "Please fill in recipient name, phone, city, and street." };
  }

  if (input.id) {
    const existing = await prisma.address.findUnique({ where: { id: input.id } });
    if (!existing || existing.userId !== session.user.id) return { error: "Address not found." };
  }

  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  const data = { label: input.label || null, recipientName: input.recipientName, phone: input.phone, region: input.region, city: input.city, street: input.street, isDefault: input.isDefault };
  if (input.id) {
    await prisma.address.update({ where: { id: input.id }, data });
  } else {
    await prisma.address.create({ data: { ...data, userId: session.user.id } });
  }

  revalidatePath("/account/addresses");
  return {};
}

export async function deleteCustomerAddressAction(id: string): Promise<void> {
  const session = await requireCustomerSession();
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) return;
  await prisma.address.delete({ where: { id } });
  revalidatePath("/account/addresses");
}

export async function updateCustomerProfileAction(_prevState: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await requireCustomerSession();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (name.length < 2) return { error: "Please enter your full name." };

  await prisma.user.update({ where: { id: session.user.id }, data: { name, phone: phone || null } });
  revalidatePath("/account");
  return undefined;
}
