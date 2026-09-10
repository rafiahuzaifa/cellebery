import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { finalizeOrderPayment } from "@/lib/orders/finalize-order-payment";

type MoyasarWebhookPayload = {
  type: string;
  secret_token?: string;
  data: {
    id: string;
    status: string;
    metadata?: { order_number?: string };
  };
};

function secretsMatch(received: string | undefined, expected: string): boolean {
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Durable fallback to the browser-redirect callback: if the customer closes
// the tab right after paying (before the redirect completes), this is what
// still confirms the order. Configure this URL + a shared secret in the
// Moyasar dashboard once MOYASAR_WEBHOOK_SECRET is set.
export async function POST(request: Request) {
  const expectedSecret = process.env.MOYASAR_WEBHOOK_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  let payload: MoyasarWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!secretsMatch(payload.secret_token, expectedSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const orderNumber = payload.data?.metadata?.order_number;
  const paymentId = payload.data?.id;
  if (!orderNumber || !paymentId) {
    return NextResponse.json({ ok: true, message: "Ignored — no order reference" });
  }

  const result = await finalizeOrderPayment(orderNumber, paymentId);
  return NextResponse.json({ ok: result.ok });
}
