import { ResendEmailProvider } from "./resend-provider";

export type EmailProviderName = "mock" | "resend";

export type OrderConfirmationEmailInput = {
  to: string;
  customerName: string;
  orderNumber: string;
  locale: "en" | "ar";
  items: { name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shipping: number;
  discount: number;
  vat: number;
  total: number;
  currency: string;
};

export interface EmailProvider {
  name: EmailProviderName;
  sendOrderConfirmation(input: OrderConfirmationEmailInput): Promise<{ sent: boolean; reason?: string }>;
}

/**
 * No RESEND_API_KEY configured — orders still succeed, the email is just not sent.
 * Mirrors src/lib/payments/payment-provider.ts's UnconfiguredPaymentProvider pattern,
 * except email failure must never block checkout, so this resolves instead of throwing.
 */
class UnconfiguredEmailProvider implements EmailProvider {
  name: EmailProviderName = "mock";
  async sendOrderConfirmation(): Promise<{ sent: boolean; reason?: string }> {
    return { sent: false, reason: "Email provider not configured (set RESEND_API_KEY to send real order confirmation emails)." };
  }
}

function resolveEmailProvider(): EmailProvider {
  return process.env.RESEND_API_KEY ? new ResendEmailProvider() : new UnconfiguredEmailProvider();
}

export const emailProvider = resolveEmailProvider();
