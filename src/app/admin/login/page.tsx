"use client";

import { useActionState } from "react";
import Image from "next/image";
import { AlertCircle, ArrowUpRight, LockKeyhole } from "lucide-react";
import { signInAction, type SignInState } from "@/lib/auth/actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(signInAction, undefined);

  return (
    <main className="grid min-h-screen place-items-center bg-[#080a0c] px-6 text-[#f3f5f5]">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Image src="/celibery-logo.svg" alt="CELIBERY" width={140} height={35} className="brand-logo" priority />
          <span className="rounded-full border border-[#22d3ee]/40 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#22d3ee]">Admin Login</span>
        </div>

        <form action={formAction} className="space-y-4 rounded-xl border border-white/10 bg-[#101416] p-6">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">Email</span>
            <input name="email" type="email" required autoFocus className="admin-input" placeholder="admin@celibery.sa" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">Password</span>
            <input name="password" type="password" required className="admin-input" placeholder="••••••••" />
          </label>

          {state?.error && (
            <p className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
              <AlertCircle size={14} className="shrink-0" /> {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-3 text-xs font-semibold text-[#080a0c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
            <LockKeyhole size={14} /> {pending ? "Signing in..." : "Sign in"} {!pending && <ArrowUpRight size={14} />}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.14em] text-white/30">CELIBERY / Saudi Arabia</p>
      </div>
    </main>
  );
}
