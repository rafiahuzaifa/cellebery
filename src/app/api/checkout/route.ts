import { NextResponse } from "next/server";
import { z } from "zod";
import { paymentProvider } from "@/lib/payments/payment-provider";
import { prisma } from "@/lib/db/prisma";

const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    quantity: z.number().int().min(1).max(20),
  })).min(1, "Cart is empty"),
  customer: z.object({
    name: z.string().trim().min(2, "Full name is required"),
    email: z.email("A valid email is required"),
    phone: z.string().trim().min(8, "A valid mobile number is required"),
  }),
  address: z.object({
    region: z.string().trim().min(1, "Region is required"),
    city: z.string().trim().min(1, "City is required"),
    street: z.string().trim().min(1, "Street address is required"),
  }),
  paymentMethod: z.enum(["card", "apple", "cod"]),
  couponCode: z.string().trim().optional(),
});

const FREE_SHIPPING_THRESHOLD = 399;
const STANDARD_SHIPPING = 25;
const VAT_RATE = 0.15;
const MOCK_COUPON_DISCOUNT_RATE = 0.1;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const { items, customer, address, paymentMethod, couponCode } = parsed.data;

  // Never trust client-submitted prices — recompute every line from the
  // database, not whatever the cart sent.
  const products = await prisma.product.findMany({
    where: { slug: { in: items.map((item) => item.id) }, status: "ACTIVE" },
    include: { translations: { where: { locale: "en" } }, inventory: true },
  });
  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  let lineItems: { productId: string; slug: string; sku: string; name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  try {
    lineItems = items.map((item) => {
      const product = productBySlug.get(item.id);
      if (!product) throw new Error(`Unknown product: ${item.id}`);
      const available = product.inventory?.stock ?? 0;
      if (item.quantity > available) throw new Error(`Only ${available} left in stock for ${product.translations[0]?.name ?? product.slug}`);
      const unitPrice = Number(product.salePrice ?? product.price);
      return {
        productId: product.id,
        slug: product.slug,
        sku: product.sku,
        name: product.translations[0]?.name ?? product.slug,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid cart item" }, { status: 400 });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const discount = couponCode ? Math.round(subtotal * MOCK_COUPON_DISCOUNT_RATE) : 0;
  const vat = Math.round((subtotal - discount) * VAT_RATE);
  const total = subtotal + shipping + vat - discount;

  const orderNumber = `CEL-${Date.now().toString(36).toUpperCase()}`;

  const intent = await paymentProvider.createIntent({
    orderId: orderNumber,
    amount: total,
    currency: "SAR",
  });

  // Cash on delivery has no gateway to verify against — the order is
  // confirmed and payment is collected on delivery. Everything else goes
  // through the configured provider's verification step immediately (the
  // mock provider always approves; a real gateway would report its actual
  // outcome here).
  let paymentStatus: "PENDING" | "PAID" | "FAILED" = "PENDING";
  let orderStatus: "PENDING" | "CONFIRMED" = "PENDING";
  let paymentReference = intent.paymentReference ?? null;

  if (paymentMethod === "cod") {
    orderStatus = "CONFIRMED";
  } else {
    const verification = await paymentProvider.verify({ provider: intent.provider, orderId: orderNumber, reference: intent.paymentReference });
    paymentReference = verification.reference ?? paymentReference;
    if (verification.status === "paid") {
      paymentStatus = "PAID";
      orderStatus = "CONFIRMED";
    } else if (verification.status === "failed") {
      return NextResponse.json({ error: "Payment failed. Please try again or choose a different payment method." }, { status: 402 });
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: customer.email.toLowerCase() },
      update: {},
      create: { email: customer.email.toLowerCase(), name: customer.name, phone: customer.phone },
    });

    const shippingAddress = await tx.address.create({
      data: {
        userId: user.id,
        recipientName: customer.name,
        phone: customer.phone,
        region: address.region,
        city: address.city,
        street: address.street,
      },
    });

    const createdOrder = await tx.order.create({
      data: {
        number: orderNumber,
        userId: user.id,
        addressId: shippingAddress.id,
        status: orderStatus,
        subtotal,
        discount,
        shipping,
        total,
        currency: "SAR",
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items: { create: lineItems.map((item) => ({ productId: item.productId, name: item.name, sku: item.sku, quantity: item.quantity, unitPrice: item.unitPrice })) },
        payment: { create: { provider: intent.provider, status: paymentStatus, amount: total, currency: "SAR", providerPaymentId: paymentReference, metadata: { paymentMethod } } },
        statusHistory: { create: { status: orderStatus } },
      },
    });

    for (const item of lineItems) {
      await tx.inventory.updateMany({ where: { productId: item.productId }, data: { stock: { decrement: item.quantity } } });
    }

    return createdOrder;
  });

  return NextResponse.json({
    orderNumber: order.number,
    customer,
    address,
    paymentMethod,
    items: lineItems,
    subtotal,
    shipping,
    vat,
    discount,
    total,
    currency: "SAR",
    payment: { ...intent, status: paymentStatus === "PAID" ? "paid" : "pending" },
  });
}
