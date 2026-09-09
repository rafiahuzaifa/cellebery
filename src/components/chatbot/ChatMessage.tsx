import { motion } from "framer-motion";
import type { ChatProductCardData } from "@/lib/ai/types";
import type { ChatUIMessage } from "./types";
import { ChatProductCard } from "./ChatProductCard";
import { ChatComparison } from "./ChatComparison";
import { ChatOrderStatus } from "./ChatOrderStatus";
import { ChatSupportCard } from "./ChatSupportCard";
import { ChatQuickActions } from "./ChatQuickActions";

export function ChatMessage({
  message,
  locale,
  isArabic,
  onAddToCart,
  onQuickAction,
  onRequestHandoff,
  disabled,
}: {
  message: ChatUIMessage;
  locale: string;
  isArabic: boolean;
  onAddToCart: (product: ChatProductCardData) => void;
  onQuickAction: (text: string) => void;
  onRequestHandoff: () => void;
  disabled?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
    >
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${isUser ? "rounded-br-sm bg-[#22d3ee] text-[#080a0c]" : "rounded-bl-sm bg-[#101416] text-white/90"}`}>
        {message.content}
      </div>

      {message.products && message.products.length > 0 && (
        <div className="flex w-full gap-3 overflow-x-auto pb-1">
          {message.products.map((product) => (
            <ChatProductCard key={product.slug} product={product} locale={locale} isArabic={isArabic} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}

      {message.comparison && <ChatComparison comparison={message.comparison} isArabic={isArabic} />}
      {message.orderStatus && <ChatOrderStatus order={message.orderStatus} isArabic={isArabic} />}
      {message.needsHumanHandoff && !isUser && <ChatSupportCard isArabic={isArabic} onRequestHandoff={onRequestHandoff} />}

      {!isUser && message.suggestedReplies && message.suggestedReplies.length > 0 && (
        <ChatQuickActions items={message.suggestedReplies} onSelect={onQuickAction} disabled={disabled} />
      )}
    </motion.div>
  );
}
