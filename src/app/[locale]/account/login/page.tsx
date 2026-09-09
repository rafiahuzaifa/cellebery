"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, LockKeyhole } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useLocale } from "@/components/locale-provider";
import { customerSignInAction, type CustomerSignInState } from "@/lib/auth/customer-actions";

export default function AccountLoginPage() {
  const { isArabic, locale } = useLocale();
  const [state, formAction, pending] = useActionState<CustomerSignInState, FormData>(customerSignInAction, undefined);

  return (
    <main className="min-h-screen bg-[#080a0c] text-[#f3f5f5]">
      <header className="border-b border-white/10"><SiteNav /></header>
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22d3ee]">{isArabic ? "حسابي" : "My Account"}</p>
        <h1 className="display-font text-5xl font-semibold uppercase leading-[0.9]">{isArabic ? "تسجيل الدخول" : "Sign in"}</h1>

        <form action={formAction} className="mt-8 space-y-4 border border-white/10 bg-[#101416] p-6">
          <input type="hidden" name="locale" value={locale} />
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "البريد الإلكتروني" : "Email"}</span>
            <input name="email" type="email" required autoFocus className="w-full border border-white/15 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[#22d3ee]" placeholder="you@example.com" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{isArabic ? "كلمة المرور" : "Password"}</span>
            <input name="password" type="password" required className="w-full border border-white/15 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[#22d3ee]" placeholder="••••••••" />
          </label>

          {state?.error && (
            <p className="flex items-center gap-2 border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
              <AlertCircle size={14} className="shrink-0" /> {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 bg-[#22d3ee] px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#080a0c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
            <LockKeyhole size={14} /> {pending ? (isArabic ? "جارٍ الدخول..." : "Signing in...") : (isArabic ? "تسجيل الدخول" : "Sign in")} {!pending && <ArrowUpRight size={14} />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/45">
          {isArabic ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
          <Link href={`/${locale}/account/register`} className="text-[#22d3ee] transition hover:text-white">{isArabic ? "أنشئ حساباً" : "Create one"}</Link>
        </p>
      </section>
    </main>
  );
}
