import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import type { ExtractedPreferences } from "@/lib/ai/types";

export type SessionContext = {
  preferences: ExtractedPreferences;
  lastRecommendedSlugs?: string[];
  lastDiscussedSlug?: string;
};

export async function loadContext(sessionId: string): Promise<SessionContext> {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId }, select: { context: true } });
  const raw = (session?.context as Partial<SessionContext> | null) ?? {};
  return { preferences: raw.preferences ?? {}, lastRecommendedSlugs: raw.lastRecommendedSlugs, lastDiscussedSlug: raw.lastDiscussedSlug };
}

export async function saveContext(sessionId: string, context: SessionContext): Promise<void> {
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { context: context as unknown as Prisma.InputJsonValue },
  });
}
