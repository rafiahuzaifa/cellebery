import type { OrderConfirmationEmailInput } from "./provider";

function money(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export function orderConfirmationSubject(input: OrderConfirmationEmailInput): string {
  return input.locale === "ar" ? `تم تأكيد طلبك ${input.orderNumber} - CELIBERY` : `Your CELIBERY order ${input.orderNumber} is confirmed`;
}

export function orderConfirmationHtml(input: OrderConfirmationEmailInput): string {
  const isArabic = input.locale === "ar";
  const rows = input.items
    .map((item) => `<tr><td style="padding:8px 0;color:#e5e7eb;">${item.name} × ${item.quantity}</td><td style="padding:8px 0;text-align:${isArabic ? "left" : "right"};color:#e5e7eb;">${money(item.unitPrice * item.quantity, input.currency)}</td></tr>`)
    .join("");

  const summaryRow = (label: string, value: string) =>
    `<tr><td style="padding:4px 0;color:#9ca3af;font-size:13px;">${label}</td><td style="padding:4px 0;text-align:${isArabic ? "left" : "right"};color:#9ca3af;font-size:13px;">${value}</td></tr>`;

  const t = isArabic
    ? { greeting: `مرحباً ${input.customerName}،`, thanks: "شكراً لطلبك من CELIBERY. إليك ملخص طلبك:", order: "الطلب", subtotal: "المجموع الفرعي", shipping: "الشحن", discount: "الخصم", vat: "ضريبة القيمة المضافة", total: "الإجمالي", free: "مجاني", footer: "سنرسل تحديثاً آخر عند شحن طلبك." }
    : { greeting: `Hi ${input.customerName},`, thanks: "Thank you for your CELIBERY order. Here's your summary:", order: "Order", subtotal: "Subtotal", shipping: "Shipping", discount: "Discount", vat: "VAT", total: "Total", free: "Free", footer: "We'll email you again once your order ships." };

  return `<!doctype html>
<html dir="${isArabic ? "rtl" : "ltr"}" lang="${input.locale}">
<body style="margin:0;background:#080a0c;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <p style="color:#22d3ee;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 24px;">CELIBERY / ${t.order} ${input.orderNumber}</p>
    <p style="color:#f3f5f5;font-size:16px;margin:0 0 4px;">${t.greeting}</p>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;">${t.thanks}</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #1f2937;border-bottom:1px solid #1f2937;padding:12px 0;">${rows}</table>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      ${summaryRow(t.subtotal, money(input.subtotal, input.currency))}
      ${input.discount > 0 ? summaryRow(t.discount, `-${money(input.discount, input.currency)}`) : ""}
      ${summaryRow(t.shipping, input.shipping === 0 ? t.free : money(input.shipping, input.currency))}
      ${summaryRow(t.vat, money(input.vat, input.currency))}
    </table>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #1f2937;margin-top:8px;padding-top:8px;">
      <tr><td style="padding:8px 0;color:#f3f5f5;font-size:15px;font-weight:600;">${t.total}</td><td style="padding:8px 0;text-align:${isArabic ? "left" : "right"};color:#f3f5f5;font-size:15px;font-weight:600;">${money(input.total, input.currency)}</td></tr>
    </table>
    <p style="color:#6b7280;font-size:12px;margin-top:32px;">${t.footer}</p>
  </div>
</body>
</html>`;
}
