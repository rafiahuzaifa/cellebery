import { NextResponse } from "next/server";
import { z } from "zod";
import { paymentProvider } from "@/lib/payments/payment-provider";
import { seedAdminProducts } from "@/lib/admin/catalog";

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
  // server-side catalog, the way an eventual Prisma-backed lookup would.
  let lineItems: { id: string; name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  try {
    lineItems = items.map((item) => {
      const product = seedAdminProducts.find((entry) => entry.id === item.id);
      if (!product) throw new Error(`Unknown product: ${item.id}`);
      const unitPrice = product.salePrice ?? product.price;
      return {
        id: product.id,
        name: product.en.name,
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

  // TODO once Supabase is connected: persist Order/OrderItem/Payment via
  // prisma here, and send the order-confirmation email via the Resend
  // abstraction. For now the confirmation is computed and returned, not
  // stored — the storefront should not claim otherwise.
  return NextResponse.json({
    orderNumber,
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
    payment: intent,
  });
}
