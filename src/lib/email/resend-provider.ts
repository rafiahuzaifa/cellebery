import type { EmailProvider, EmailProviderName, OrderConfirmationEmailInput } from "./provider";
import { orderConfirmationHtml, orderConfirmationSubject } from "./templates";

/**
 * Calls the Resend REST API directly via fetch — no SDK dependency needed for a single
 * transactional email type. Requires RESEND_API_KEY; EMAIL_FROM defaults to Resend's
 * pre-verified sandbox sender (onboarding@resend.dev) so this works immediately on a
 * free Resend account without first verifying a custom domain.
 */
export class ResendEmailProvider implements EmailProvider {
  name: EmailProviderName = "resend";

  async sendOrderConfirmation(input: OrderConfirmationEmailInput): Promise<{ sent: boolean; reason?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { sent: false, reason: "RESEND_API_KEY is not configured" };

    const from = process.env.EMAIL_FROM ?? "CELIBERY <onboarding@resend.dev>";

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from,
          to: input.to,
          subject: orderConfirmationSubject(input),
          html: orderConfirmationHtml(input),
        }),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        return { sent: false, reason: `Resend responded ${response.status}: ${body.slice(0, 200)}` };
      }
      return { sent: true };
    } catch (error) {
      return { sent: false, reason: error instanceof Error ? error.message : "Unknown email error" };
    }
  }
}
