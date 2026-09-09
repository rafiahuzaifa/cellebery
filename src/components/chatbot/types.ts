import type { ChatComparisonData, ChatOrderStatusData, ChatProductCardData } from "@/lib/ai/types";

export type ChatUIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ChatProductCardData[];
  comparison?: ChatComparisonData;
  orderStatus?: ChatOrderStatusData;
  suggestedReplies?: string[];
  needsHumanHandoff?: boolean;
};
