import { Package } from "lucide-react";
import type { ChatOrderStatusData } from "@/lib/ai/types";

export function ChatOrderStatus({ order, isArabic }: { order: ChatOrderStatusData; isArabic: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#101416] p-4">
      <div className="flex items-center gap-2 text-[#22d3ee]">
        <Package size={15} />
        <span className="text-sm font-semibold text-white/90">{order.orderNumber}</span>
      </div>
      <p className="mt-2 text-xs text-white/60">
        {isArabic ? "الحالة:" : "Status:"} <span className="font-semibold text-white/85">{order.status}</span>
      </p>
      <ul className="mt-2 space-y-1 text-[11px] text-white/50">
        {order.items.map((item, index) => (
          <li key={index}>{item.name} × {item.quantity}</li>
        ))}
      </ul>
      {!order.trackingAvailable && (
        <p className="mt-2 text-[10px] text-white/35">{isArabic ? "معلومات التتبع غير متوفرة بعد." : "Tracking information is not available yet."}</p>
      )}
    </div>
  );
}
