import { getChatbotStats } from "@/actions/chatbot-analytics";
import { ChatbotDashboard } from "@/components/admin/chatbot-dashboard";

export default async function AdminChatbotPage() {
  const stats = await getChatbotStats();
  return <ChatbotDashboard stats={stats} />;
}
