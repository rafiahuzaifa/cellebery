"use server";

import { prisma } from "@/lib/db/prisma";

export type ChatbotStats = {
  totalConversations: number;
  conversationsToday: number;
  totalMessages: number;
  humanHandoffs: number;
  avgMessagesPerConversation: number;
  mostAskedIntents: { intent: string; count: number }[];
  eventCounts: Record<string, number>;
  recentSessions: { id: string; language: string; messageCount: number; lastMessageAt: string | null; handoff: boolean }[];
};

export async function getChatbotStats(): Promise<ChatbotStats> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalConversations, conversationsToday, totalMessages, eventGroups, assistantMessages, sessions] = await Promise.all([
    prisma.chatSession.count(),
    prisma.chatSession.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.chatMessage.count(),
    prisma.chatEvent.groupBy({ by: ["type"], _count: { type: true } }),
    prisma.chatMessage.findMany({ where: { role: "ASSISTANT" }, select: { metadata: true } }),
    prisma.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        messages: { orderBy: { createdAt: "asc" }, select: { id: true, createdAt: true } },
        events: { where: { type: "support_handoff" }, select: { id: true } },
      },
    }),
  ]);

  const eventCounts: Record<string, number> = {};
  for (const group of eventGroups) eventCounts[group.type] = group._count.type;

  const intentCounts = new Map<string, number>();
  for (const message of assistantMessages) {
    const intent = (message.metadata as { intent?: string } | null)?.intent;
    if (intent) intentCounts.set(intent, (intentCounts.get(intent) ?? 0) + 1);
  }
  const mostAskedIntents = [...intentCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([intent, count]) => ({ intent, count }));

  const humanHandoffs = eventCounts.support_handoff ?? 0;
  const avgMessagesPerConversation = totalConversations > 0 ? Math.round((totalMessages / totalConversations) * 10) / 10 : 0;

  const recentSessions = sessions.map((session) => ({
    id: session.id,
    language: session.language,
    messageCount: session.messages.length,
    lastMessageAt: session.messages.length > 0 ? session.messages[session.messages.length - 1].createdAt.toISOString() : null,
    handoff: session.events.length > 0,
  }));

  return {
    totalConversations,
    conversationsToday,
    totalMessages,
    humanHandoffs,
    avgMessagesPerConversation,
    mostAskedIntents,
    eventCounts,
    recentSessions,
  };
}
