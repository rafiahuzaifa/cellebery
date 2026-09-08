export type PaymentProviderName = "mock" | "mada" | "stripe" | "tap" | "other";

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

  async verify({ orderId, provider = "mock" }: {
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

export const paymentProvider = new MockPaymentProvider();
