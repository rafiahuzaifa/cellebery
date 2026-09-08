import type { Metadata } from "next";
import { manrope, arabic } from "@/lib/fonts";
import { LocaleProvider } from "@/components/locale-provider";
import { CartProvider } from "@/components/cart-provider";
import { WishlistProvider } from "@/components/wishlist-provider";
import { AdminShell } from "@/components/admin/admin-shell";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "CELIBERY Admin",
  description: "CELIBERY admin panel",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={`${manrope.variable} ${arabic.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LocaleProvider initialLocale="en" navigable={false}>
          <WishlistProvider>
            <CartProvider>
              <AdminShell>{children}</AdminShell>
            </CartProvider>
          </WishlistProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
