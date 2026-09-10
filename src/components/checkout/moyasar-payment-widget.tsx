"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import Script from "next/script";

declare global {
  interface Window {
    Moyasar?: {
      init: (config: {
        element: string;
        amount: number;
        currency: string;
        description: string;
        publishable_api_key: string;
        callback_url: string;
        methods: string[];
        supported_networks?: string[];
        metadata?: Record<string, string>;
        language?: "en" | "ar";
        on_failure?: (error: unknown) => void;
      }) => void;
    };
  }
}

export function MoyasarPaymentWidget({ orderNumber, amountHalalas, currency, locale, isArabic }: {
  orderNumber: string;
  amountHalalas: number;
  currency: string;
  locale: string;
  isArabic: boolean;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY;
  const [scriptReady, setScriptReady] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!scriptReady || !publishableKey || initialized.current || typeof window === "undefined") return;
    if (!window.Moyasar) return;
    initialized.current = true;

    const origin = window.location.origin;
    window.Moyasar.init({
      element: ".mysr-form",
      amount: amountHalalas,
      currency,
      description: `CELIBERY order ${orderNumber}`,
      publishable_api_key: publishableKey,
      callback_url: `${origin}/api/payments/moyasar/callback?order=${encodeURIComponent(orderNumber)}&locale=${locale}`,
      methods: ["creditcard", "applepay"],
      supported_networks: ["visa", "mastercard", "mada"],
      metadata: { order_number: orderNumber },
      language: isArabic ? "ar" : "en",
      on_failure: () => setWidgetError(isArabic ? "فشلت عملية الدفع. حاول مرة أخرى." : "Payment failed. Please try again."),
    });
  }, [scriptReady, publishableKey, amountHalalas, currency, orderNumber, locale, isArabic]);

  if (!publishableKey) {
    return (
      <p className="flex items-start gap-2 border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs leading-5 text-amber-200">
        <AlertCircle size={15} className="mt-0.5 shrink-0" />
        {isArabic
          ? "بوابة الدفع غير مُفعّلة بعد. يرجى التواصل مع المتجر لإتمام الطلب."
          : "Card payments aren't activated yet on this store. Please contact us to complete this order."}
      </p>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdn.moyasar.com/moyasar.css" />
      <Script src="https://cdn.moyasar.com/moyasar.js" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
      <div className="mysr-form" />
      {widgetError && <p className="mt-3 text-xs text-red-300">{widgetError}</p>}
    </>
  );
}
