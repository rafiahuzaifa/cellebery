export type ChatRole = "user" | "assistant" | "system";

export type AIMessage = {
  role: ChatRole;
  content: string;
};

export type ChatIntent =
  | "greeting"
  | "product_discovery"
  | "product_question"
  | "comparison"
  | "cart_action"
  | "order_status"
  | "shipping"
  | "warranty_returns"
  | "faq"
  | "support_handoff"
  | "unknown";

export type UseCase = "music" | "travel" | "work" | "gaming" | "fitness" | "movies";

export type ExtractedPreferences = {
  category?: "headphones" | "earbuds" | "speakers" | "accessories";
  useCase?: UseCase;
  priorities?: string[];
  budgetMax?: number;
};

export type ChatProductCardData = {
  slug: string;
  name: string;
  reason: string;
  price: number;
  salePrice: number | null;
  rating: number;
  image: string;
  inStock: boolean;
  keySpec?: string;
};

export type ChatComparisonRow = { label: string; values: string[] };

export type ChatComparisonData = {
  products: ChatProductCardData[];
  rows: ChatComparisonRow[];
  bestOverall?: string;
  bestForTravel?: string;
  bestValue?: string;
};

export type ChatOrderStatusData = {
  orderNumber: string;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
  trackingAvailable: boolean;
};

export type ChatAction =
  | { type: "view_product"; slug: string }
  | { type: "add_to_cart"; slug: string; name: string; price: number; image: string }
  | { type: "view_cart" }
  | { type: "compare_products"; slugs: string[] };

export type StructuredResponse = {
  message: string;
  intent: ChatIntent;
  products: ChatProductCardData[];
  comparison?: ChatComparisonData;
  orderStatus?: ChatOrderStatusData;
  actions: ChatAction[];
  suggestedReplies: string[];
  needsHumanHandoff: boolean;
  sessionId: string;
};

export type ChatContext = {
  locale: "en" | "ar";
  sessionId: string;
  history: AIMessage[];
  preferences: ExtractedPreferences;
  productContext?: string;
};
