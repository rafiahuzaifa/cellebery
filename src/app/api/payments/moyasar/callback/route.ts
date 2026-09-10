import { NextResponse } from "next/server";
import { finalizeOrderPayment } from "@/lib/orders/finalize-order-payment";

// Moyasar redirects the browser here after the card form / 3D Secure step,
// appending its own ?id=&status=&message= to whatever we set as
// callback_url. The status/message query params are attacker-controllable
// (they're just the URL) so they're intentionally ignored below —
// finalizeOrderPayment() re-fetches the real status from Moyasar's API
// using the secret key before ever marking an order paid.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("order");
  const locale = url.searchParams.get("locale") === "ar" ? "ar" : "en";
  const paymentId = url.searchParams.get("id");

  if (!orderNumber) {
    return NextResponse.redirect(new URL(`/${locale}/shop`, url.origin));
  }
  if (!paymentId) {
    return NextResponse.redirect(new URL(`/${locale}/checkout/pay/${orderNumber}?error=1`, url.origin));
  }

  const result = await finalizeOrderPayment(orderNumber, paymentId, locale);

  if (result.ok) {
    return NextResponse.redirect(new URL(`/${locale}/checkout/confirmation/${orderNumber}`, url.origin));
  }
  return NextResponse.redirect(new URL(`/${locale}/checkout/pay/${orderNumber}?error=1`, url.origin));
}
