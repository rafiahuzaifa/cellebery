import type { PaymentIntent, PaymentProvider, PaymentVerification, PaymentWebhook } from "@/lib/payments/payment-provider";

const API_BASE = "https://api.moyasar.com/v1";

function basicAuthHeader(secretKey: string): string {
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

type MoyasarPaymentResponse = {
  id: string;
  status: "initiated" | "paid" | "authorized" | "failed" | "refunded" | "captured" | "voided" | "verified";
  amount: number;
  currency: string;
};

/**
 * Card/Apple Pay payments are created client-side by Moyasar's hosted
 * Payment Form widget (using the publishable key) — our backend never
 * touches card details. This provider's job is only to verify what the
 * widget/webhook reports, against Moyasar's API, using the secret key.
 * See src/app/[locale]/checkout/pay/[orderNumber] for the widget and
 * src/lib/orders/finalize-order-payment.ts for how verify() gets used.
 */
export class MoyasarPaymentProvider implements PaymentProvider {
  name = "moyasar" as const;

  constructor(private secretKey: string) {}

  async createIntent({ orderId, amount, currency = "SAR" }: {
    orderId: string;
    amount: number;
    currency?: string;
  }): Promise<PaymentIntent> {
    // No API call here — the real Moyasar payment is created by the
    // browser-side widget. This just tells checkout to redirect there.
    return { provider: this.name, orderId, amount, currency, status: "pending" };
  }

  async verify({ orderId, reference }: {
    provider: "moyasar";
    orderId: string;
    reference?: string;
  }): Promise<PaymentVerification> {
    if (!reference) {
      return { provider: this.name, orderId, amount: 0, currency: "SAR", status: "pending" };
    }

    const response = await fetch(`${API_BASE}/payments/${encodeURIComponent(reference)}`, {
      headers: { Authorization: basicAuthHeader(this.secretKey) },
    });

    if (!response.ok) {
      return { provider: this.name, orderId, amount: 0, currency: "SAR", status: "pending", reference };
    }

    const payment = (await response.json()) as MoyasarPaymentResponse;
    const status = payment.status === "paid" || payment.status === "captured" ? "paid" : payment.status === "failed" ? "failed" : "pending";

    return {
      provider: this.name,
      orderId,
      amount: payment.amount,
      currency: payment.currency,
      status,
      reference: payment.id,
    };
  }

  async handleWebhook(payload: PaymentWebhook): Promise<{ ok: boolean; message: string }> {
    return { ok: true, message: `Received webhook for ${payload.orderId}` };
  }
}
