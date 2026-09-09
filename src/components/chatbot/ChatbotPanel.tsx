"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/components/locale-provider";
import { useCart } from "@/components/cart-provider";
import type { ChatProductCardData, StructuredResponse } from "@/lib/ai/types";
import type { ChatUIMessage } from "./types";
import { ChatHeader } from "./ChatHeader";
import { ChatWelcome } from "./ChatWelcome";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import { ChatTypingIndicator } from "./ChatTypingIndicator";

type SessionMessage = { id: string; role: "user" | "assistant"; content: string; metadata: unknown; createdAt: string };

function toUIMessage(raw: SessionMessage): ChatUIMessage {
  const metadata = (raw.metadata ?? {}) as Partial<StructuredResponse>;
  return {
    id: raw.id,
    role: raw.role,
    content: raw.content,
    products: metadata.products,
  };
}

export function ChatbotPanel({
  guestKey,
  productContext,
  productName,
  onMinimize,
  onClose,
}: {
  guestKey: string;
  productContext?: string;
  productName?: string;
  onMinimize: () => void;
  onClose: () => void;
}) {
  const { isArabic, locale, setLocale } = useLocale();
  const { addItem } = useCart();
  const [messages, setMessages] = useState<ChatUIMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/chat/session?guestKey=${encodeURIComponent(guestKey)}`)
      .then((res) => res.json())
      .then((data: { messages: SessionMessage[] }) => {
        if (!cancelled) setMessages((data.messages ?? []).map(toUIMessage));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [guestKey]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const applyActions = (response: StructuredResponse) => {
    for (const action of response.actions) {
      if (action.type === "add_to_cart") {
        addItem({ id: action.slug, name: action.name, price: action.price, image: action.image });
      }
    }
  };

  const send = async (text: string) => {
    if (sending) return;
    const userMessage: ChatUIMessage = { id: `local-${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, guestKey, locale, productContext }),
      });
      const data = (await res.json()) as StructuredResponse;
      applyActions(data);
      setMessages((prev) => [...prev, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        products: data.products,
        comparison: data.comparison,
        orderStatus: data.orderStatus,
        suggestedReplies: data.suggestedReplies,
        needsHumanHandoff: data.needsHumanHandoff,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: isArabic ? "انقطع الاتصال. حاول مرة أخرى." : "Connection interrupted. Please try again.",
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleAddToCart = (product: ChatProductCardData) => {
    addItem({ id: product.slug, name: product.name, price: product.salePrice ?? product.price, image: product.image });
  };

  const handleClear = async () => {
    setMessages([]);
    try {
      await fetch("/api/chat/session", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestKey }) });
    } catch {
      // best-effort — local state is already cleared
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      dir={isArabic ? "rtl" : "ltr"}
      role="dialog"
      aria-label="CELIBERY AI"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0a0d0f] text-[#f3f5f5] sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[680px] sm:w-[400px] sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl sm:shadow-black/50 rtl:sm:right-auto rtl:sm:left-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ChatHeader
        isArabic={isArabic}
        onToggleLocale={() => setLocale(isArabic ? "en" : "ar")}
        onMinimize={onMinimize}
        onClear={handleClear}
        onClose={onClose}
      />

      <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {loaded && messages.length === 0 && <ChatWelcome isArabic={isArabic} onSelect={send} productName={productName} />}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            locale={locale}
            isArabic={isArabic}
            onAddToCart={handleAddToCart}
            onQuickAction={send}
            onRequestHandoff={() => send(isArabic ? "أريد التحدث مع فريق الدعم" : "I'd like to talk to a human")}
            disabled={sending}
          />
        ))}
        {sending && <ChatTypingIndicator />}
      </div>

      <ChatComposer isArabic={isArabic} disabled={sending} onSend={send} />
    </motion.div>
  );
}
