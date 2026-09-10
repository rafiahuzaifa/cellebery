import { MoyasarPaymentProvider } from "@/lib/payments/providers/moyasar";

export type PaymentProviderName = "mock" | "cod" | "moyasar" | "stripe" | "tap" | "other";

export type PaymentIntent = {
  provider: PaymentProviderName;
  orderId: string;
  amount: number;
  currency: string;
  status: "pending" | "authorized" | "paid" | "failed";
  checkoutUrl?: string;
  paymentReference?: string;
};

export type PaymentVerification = {
  provider: PaymentProviderName;
  orderId: string;
  amount: number;
  currency: string;
  status: "paid" | "failed" | "pending";
  reference?: string;
};

export type PaymentWebhook = {
  provider: PaymentProviderName;
  event: string;
  orderId: string;
  reference?: string;
  status: "paid" | "failed" | "pending";
  rawPayload?: Record<string, unknown>;
};

export interface PaymentProvider {
  name: PaymentProviderName;
  createIntent(input: {
    orderId: string;
    amount: number;
    currency?: string;
  }): Promise<PaymentIntent>;
  verify(input: {
    provider: PaymentProviderName;
    orderId: string;
    reference?: string;
  }): Promise<PaymentVerification>;
  handleWebhook(payload: PaymentWebhook): Promise<{ ok: boolean; message: string }>;
}

/**
 * Real gateways plug in here by implementing PaymentProvider and
 * registering below — checkout code never changes, only PAYMENT_PROVIDER
 * in the environment. Moyasar (Mada/cards/Apple Pay) is wired up below;
 * others (Tap, Stripe) fall through to this unconfigured stub until built.
 */
class UnconfiguredPaymentProvider implements PaymentProvider {
  constructor(public name: PaymentProviderName) {}

  private fail(): never {
    throw new Error(`Payment provider "${this.name}" is not configured. Set PAYMENT_PROVIDER_KEY/PAYMENT_PROVIDER_SECRET and implement its adapter, or use PAYMENT_PROVIDER=mock for development.`);
  }

  async createIntent(): Promise<PaymentIntent> {
    this.fail();
  }

  async verify(): Promise<PaymentVerification> {
    this.fail();
  }

  async handleWebhook(): Promise<{ ok: boolean; message: string }> {
    this.fail();
  }
}

export class MockPaymentProvider implements PaymentProvider {
  name: PaymentProviderName = "mock";

  async createIntent({ orderId, amount, currency = "SAR" }: {
    orderId: string;
    amount: number;
    currency?: string;
  }): Promise<PaymentIntent> {
    return {
      provider: this.name,
      orderId,
      amount,
      currency,
      status: "pending",
      checkoutUrl: `/cart?mock-payment=${encodeURIComponent(orderId)}`,
      paymentReference: `mock_${orderId}_${Date.now()}`,
    };
  }

  async verify({ orderId, provider = "mock", reference }: {
    provider: PaymentProviderName;
    orderId: string;
    reference?: string;
  }): Promise<PaymentVerification> {
    return {
      provider,
      orderId,
      amount: 0,
      currency: "SAR",
      status: "paid",
      reference: reference ?? `mock_${orderId}`,
    };
  }

  async handleWebhook(payload: PaymentWebhook): Promise<{ ok: boolean; message: string }> {
    return {
      ok: true,
      message: `Payment webhook accepted for ${payload.orderId}`,
    };
  }
}

function resolvePaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER ?? "mock") as PaymentProviderName;
  if (name === "mock") return new MockPaymentProvider();
  if (name === "moyasar") {
    const secretKey = process.env.MOYASAR_SECRET_KEY;
    if (secretKey) return new MoyasarPaymentProvider(secretKey);
    return new UnconfiguredPaymentProvider(name);
  }
  // tap / stripe / other: real adapters are not implemented yet.
  // Swapping PAYMENT_PROVIDER back to "mock" keeps development unblocked.
  return new UnconfiguredPaymentProvider(name);
}

export const paymentProvider = resolvePaymentProvider();
