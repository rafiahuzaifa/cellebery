import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { SiteNav } from "@/components/site-nav";
import { MoyasarPaymentWidget } from "@/components/checkout/moyasar-payment-widget";

export default async function CheckoutPayPage({ params }: PageProps<"/[locale]/checkout/pay/[orderNumber]">) {
  const { locale, orderNumber } = await params;
  const isArabic = locale === "ar";

  const order = await prisma.order.findUnique({
    where: { number: orderNumber },
    select: { number: true, total: true, currency: true, customerEmail: true, payment: { select: { status: true } } },
  });

  if (!order) {
    return (
      <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
        <header className="border-b border-white/10"><SiteNav /></header>
        <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold">{isArabic ? "الطلب غير موجود" : "Order not found"}</h1>
        </section>
      </main>
    );
  }

  if (order.payment?.status === "PAID") {
    redirect(`/${locale}/checkout/confirmation/${orderNumber}`);
  }

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{order.number}</p>
        <h1 className="display-font text-4xl font-semibold uppercase leading-[0.9]">{isArabic ? "إتمام الدفع" : "Complete payment"}</h1>
        <p className="mt-3 text-sm text-white/50">SAR {Number(order.total).toFixed(2)}</p>

        <div className="mt-8">
          <MoyasarPaymentWidget
            orderNumber={order.number}
            amountHalalas={Math.round(Number(order.total) * 100)}
            currency={order.currency}
            locale={locale}
            isArabic={isArabic}
          />
        </div>
      </section>
    </main>
  );
}
