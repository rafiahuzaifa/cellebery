import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080a0c] text-[#f3f5f5]">
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <div className="absolute inset-0 opacity-90">
          <div className="full-media absolute inset-0 bg-[url('/ChatGPT%20Image%20Aug%2027,%202026,%2005_23_32%20PM.png')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080a0c]/80 via-[#080a0c]/70 to-[#080a0c]" />
        </div>

        <div className="relative z-10 max-w-2xl text-center">
          <div className="mb-8 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9ff6ed]">
            <span className="h-px w-10 bg-[#9ff6ed]" />
            CELIBERY
            <span className="h-px w-10 bg-[#9ff6ed]" />
          </div>
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
            SOUND WITHOUT LIMITS
          </p>
          <h1 className="display-font text-7xl font-semibold uppercase leading-none sm:text-8xl">
            404
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/60">
            The signal you requested is not available.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="inline-flex items-center justify-center bg-[#9ff6ed] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#080a0c] transition hover:bg-white">
              Return home
            </Link>
            <Link href="/shop" className="inline-flex items-center justify-center border border-white/25 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:border-[#9ff6ed] hover:text-[#9ff6ed]">
              Shop collection
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
