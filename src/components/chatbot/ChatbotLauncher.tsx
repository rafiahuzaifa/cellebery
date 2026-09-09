"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { getPublicProductBySlug } from "@/actions/products";
import { ChatbotPanel } from "./ChatbotPanel";

const GUEST_KEY_STORAGE = "celibery-chat-guest-key";

function getOrCreateGuestKey(): string {
  const existing = window.localStorage.getItem(GUEST_KEY_STORAGE);
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  window.localStorage.setItem(GUEST_KEY_STORAGE, fresh);
  return fresh;
}

// No external changes to subscribe to — the key is created once and never changes.
function subscribeNoop() {
  return () => {};
}

/** SSR-safe guest identity, mirroring the useSyncExternalStore pattern already used by
 * cart-provider.tsx / wishlist-provider.tsx: server always sees "", client resolves the
 * real (or newly created) key on first render — no effect, no hydration mismatch. */
function useGuestKey(): string {
  return useSyncExternalStore(subscribeNoop, getOrCreateGuestKey, () => "");
}

export function ChatbotLauncher() {
  const { isArabic } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const guestKey = useGuestKey();

  const productSlugMatch = pathname.match(/\/shop\/([^/?#]+)$/);
  const productContext = productSlugMatch?.[1];

  const [productName, setProductName] = useState<string | undefined>(undefined);
  const [renderedContext, setRenderedContext] = useState(productContext);
  if (renderedContext !== productContext) {
    setRenderedContext(productContext);
    setProductName(undefined);
  }

  useEffect(() => {
    if (!productContext) return;
    let cancelled = false;
    getPublicProductBySlug(productContext)
      .then((product) => {
        if (!cancelled) setProductName(product ? (isArabic && product.ar.name ? product.ar.name : product.en.name) : undefined);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [productContext, isArabic]);

  if (process.env.NEXT_PUBLIC_CHATBOT_ENABLED === "false") return null;
  if (!guestKey) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <ChatbotPanel
            guestKey={guestKey}
            productContext={productContext}
            productName={productName}
            onMinimize={() => setOpen(false)}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isArabic ? "اسأل مساعد CELIBERY" : "Ask CELIBERY AI"}
          aria-label={isArabic ? "اسأل مساعد CELIBERY" : "Ask CELIBERY AI"}
          className="group fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full border border-white/10 bg-[#101416]/90 text-[#22d3ee] shadow-lg shadow-black/40 backdrop-blur-sm transition hover:border-[#22d3ee]/50 rtl:right-auto rtl:left-5 md:bottom-6 md:right-6 md:size-15 rtl:md:left-6"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <span className="absolute inset-0 rounded-full bg-[#22d3ee]/15 motion-safe:animate-ping [animation-duration:3s]" />
          <MessageCircle size={24} strokeWidth={1.6} className="relative" />
        </motion.button>
      )}
    </>
  );
}
