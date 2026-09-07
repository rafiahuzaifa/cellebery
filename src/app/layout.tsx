import type { Metadata } from "next";
import { Manrope, Noto_Kufi_Arabic } from "next/font/google";
import { LocaleProvider } from "@/components/locale-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const arabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "CELIBERY | Sound Without Limits",
  description: "Premium audio engineered for everyday life.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${arabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><LocaleProvider>{children}</LocaleProvider></body>
    </html>
  );
}
