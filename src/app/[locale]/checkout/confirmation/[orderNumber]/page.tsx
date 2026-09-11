import Link from "next/link";
import { Check } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { SiteNav } from "@/components/site-nav";

export default async function CheckoutConfirmationPage({ params }: PageProps<"/[locale]/checkout/confirmation/[orderNumber]">) {
  const { locale, orderNumber } = await params;
  const isArabic = locale === "ar";

  const order = await prisma.order.findUnique({
    where: { number: orderNumber },
    select: { number: true, total: true, payment: { select: { status: true } } },
  });

  const paid = order?.payment?.status === "PAID";

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>
      <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
        {order && paid ? (
          <>
            <div className="grid size-16 place-items-center rounded-full bg-[#22d3ee] text-[#080a0c]"><Check size={28} /></div>
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#22d3ee]">{order.number}</p>
            <h1 className="display-font mt-5 text-6xl font-semibold uppercase leading-[0.88] sm:text-8xl">{isArabic ? "تم تأكيد طلبك" : "Order confirmed"}</h1>
            <p className="mt-7 max-w-md text-sm leading-7 text-white/50">{isArabic ? "شكراً لك. سنرسل تفاصيل التوصيل إلى بريدك الإلكتروني." : "Thank you. We'll send your delivery details to your email."}</p>
            <p className="mt-4 text-lg text-white/80">SAR {Number(order.total).toFixed(2)}</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold">{isArabic ? "لم يتم تأكيد الدفع بعد" : "Payment not confirmed yet"}</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/50">
              {isArabic ? "إذا خصم المبلغ من بطاقتك، سيتم تأكيد طلبك تلقائياً خلال دقائق." : "If your card was charged, your order will confirm automatically within a few minutes."}
            </p>
            {orderNumber && <Link href={`/${locale}/checkout/pay/${orderNumber}`} className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 transition hover:border-[#22d3ee] hover:text-[#22d3ee]">{isArabic ? "المحاولة مرة أخرى" : "Try again"}</Link>}
          </>
        )}
        <Link href={`/${locale}/shop`} className="mt-9 inline-flex items-center gap-6 rounded-full bg-[#22d3ee] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#080a0c] transition hover:shadow-[0_0_28px_rgba(34,211,238,0.45)]">{isArabic ? "متابعة التسوق" : "Continue shopping"}</Link>
      </section>
    </main>
  );
}
