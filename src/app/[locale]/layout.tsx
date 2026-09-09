import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { manrope, arabic } from "@/lib/fonts";
import { LocaleProvider, type Locale } from "@/components/locale-provider";
import { CartProvider } from "@/components/cart-provider";
import { WishlistProvider } from "@/components/wishlist-provider";
import { ChatbotLauncher } from "@/components/chatbot/ChatbotLauncher";
import { SessionProvider } from "next-auth/react";
import "@/app/globals.css";

const LOCALES: Locale[] = ["en", "ar"];

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "CELIBERY | Sound Without Limits",
  description: "Premium audio engineered for everyday life.",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  const activeLocale = locale as Locale;

  return (
    <html
      lang={activeLocale}
      dir={activeLocale === "ar" ? "rtl" : "ltr"}
      className={`${manrope.variable} ${arabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* No server-side auth() call here on purpose: reading the session server-side
            in the root layout would force every storefront page to render dynamically
            instead of the static generation the shop/home pages rely on. SessionProvider
            fetches the session client-side instead (a brief pre-hydration "signed out"
            state in the nav icon is an acceptable trade for keeping SSG). */}
        <SessionProvider>
          <LocaleProvider initialLocale={activeLocale}>
            <WishlistProvider>
              <CartProvider>
                {children}
                <ChatbotLauncher />
              </CartProvider>
            </WishlistProvider>
          </LocaleProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
