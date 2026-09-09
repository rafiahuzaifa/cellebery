"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function ChatComposer({ isArabic, disabled, onSend }: { isArabic: boolean; disabled?: boolean; onSend: (text: string) => void }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="flex items-center gap-2 border-t border-white/10 bg-[#0d1113] p-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder={isArabic ? "اسأل عن المنتجات، الطلبات أو الدعم..." : "Ask about products, orders or support..."}
        disabled={disabled}
        aria-label={isArabic ? "اكتب رسالتك" : "Type your message"}
        className="min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#22d3ee] disabled:opacity-50"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label={isArabic ? "إرسال" : "Send"}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-[#22d3ee] text-[#080a0c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
