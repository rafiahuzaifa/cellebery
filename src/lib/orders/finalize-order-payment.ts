import { prisma } from "@/lib/db/prisma";
import { paymentProvider } from "@/lib/payments/payment-provider";
import { emailProvider } from "@/lib/email/provider";

export type FinalizeResult =
  | { ok: true; alreadyFinalized: true; orderNumber: string }
  | { ok: true; alreadyFinalized: false; orderNumber: string }
  | { ok: false; reason: "not_found" | "amount_mismatch" | "not_paid"; orderNumber: string };

/**
 * The single place that turns a gateway's report of "this payment is paid"
 * into an actually-confirmed order: re-verifies against the gateway itself
 * (never trusts a redirect query string or webhook body on its own), checks
 * the paid amount matches what we charged for, then — and only then —
 * decrements stock and marks the order confirmed. Called from both the
 * card/Apple Pay browser-redirect callback and the webhook, so it has to be
 * safe to run twice for the same payment.
 */
export async function finalizeOrderPayment(orderNumber: string, providerPaymentId: string, locale: "en" | "ar" = "en"): Promise<FinalizeResult> {
  const order = await prisma.order.findUnique({
    where: { number: orderNumber },
    include: { payment: true, items: true, user: true },
  });
  if (!order || !order.payment) return { ok: false, reason: "not_found", orderNumber };

  if (order.payment.status === "PAID") {
    return { ok: true, alreadyFinalized: true, orderNumber };
  }

  const verification = await paymentProvider.verify({
    provider: order.payment.provider as Parameters<typeof paymentProvider.verify>[0]["provider"],
    orderId: orderNumber,
    reference: providerPaymentId,
  });

  if (verification.status !== "paid") {
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: { status: verification.status === "failed" ? "FAILED" : "PENDING", providerPaymentId },
    });
    return { ok: false, reason: "not_paid", orderNumber };
  }

  // Moyasar reports amounts in halalas (smallest currency unit) — convert
  // before comparing against our SAR-denominated order total. A mismatch
  // means the payment id doesn't actually correspond to what we charged
  // for (wrong id, tampered callback, replay) — never mark paid on trust.
  const paidAmount = verification.amount / 100;
  if (Math.abs(paidAmount - Number(order.total)) > 0.01) {
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: { status: "FAILED", providerPaymentId, metadata: { ...(order.payment.metadata as object), amountMismatch: { expected: Number(order.total), paid: paidAmount } } },
    });
    return { ok: false, reason: "amount_mismatch", orderNumber };
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.inventory.updateMany({ where: { productId: item.productId }, data: { stock: { decrement: item.quantity } } });
    }
    await tx.payment.update({ where: { id: order.payment!.id }, data: { status: "PAID", providerPaymentId } });
    await tx.order.update({ where: { id: order.id }, data: { status: "CONFIRMED" } });
    await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "CONFIRMED", note: "Payment verified" } });
    if (order.couponId) {
      await tx.coupon.update({ where: { id: order.couponId }, data: { usageCount: { increment: 1 } } });
    }
  });

  try {
    const items = order.items.map((item) => ({ name: item.name, quantity: item.quantity, unitPrice: Number(item.unitPrice) }));
    const subtotal = Number(order.subtotal);
    const shipping = Number(order.shipping);
    const discount = Number(order.discount);
    const total = Number(order.total);
    await emailProvider.sendOrderConfirmation({
      to: order.customerEmail,
      customerName: order.user?.name ?? order.customerEmail,
      orderNumber: order.number,
      locale,
      items,
      subtotal,
      shipping,
      discount,
      vat: total - subtotal - shipping + discount,
      total,
      currency: order.currency,
    });
  } catch {
    // swallow — payment is confirmed regardless of email delivery
  }

  return { ok: true, alreadyFinalized: false, orderNumber };
}
