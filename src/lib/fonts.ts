import { Manrope, Noto_Kufi_Arabic } from "next/font/google";

export const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const arabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});
