import type { Metadata } from "next";
import { manrope, arabic } from "@/lib/fonts";
import { LocaleProvider } from "@/components/locale-provider";
import { CartProvider } from "@/components/cart-provider";
import { WishlistProvider } from "@/components/wishlist-provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "CELIBERY Admin",
  description: "CELIBERY admin panel",
};

// The admin sidebar/shell lives in (protected)/layout.tsx, not here — the
// login page needs this same html/body/providers shell but must not show
// the authenticated admin chrome (and must not itself be behind the auth
// check, or logging in would redirect-loop back to itself).
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={`${manrope.variable} ${arabic.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LocaleProvider initialLocale="en" navigable={false}>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
