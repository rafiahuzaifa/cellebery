"use client";

/** Fire-and-forget client-side event log for the admin chatbot analytics dashboard.
 * Never throws, never blocks the UI — a dropped analytics event is not worth
 * disrupting the customer's experience over. */
export function trackChatEvent(guestKey: string, type: "chat_opened" | "chat_closed" | "product_clicked" | "product_added_to_cart", metadata?: Record<string, unknown>) {
  if (!guestKey) return;
  fetch("/api/chat/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guestKey, type, metadata }),
    keepalive: true,
  }).catch(() => {});
}
