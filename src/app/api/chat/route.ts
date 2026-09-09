import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { runChatPipeline } from "@/lib/chatbot/pipeline";
import type { AIMessage } from "@/lib/ai/types";

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  guestKey: z.string().trim().min(8).max(100),
  locale: z.enum(["en", "ar"]),
  productContext: z.string().trim().max(200).optional(),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = Number(process.env.CHAT_RATE_LIMIT ?? 20);
const HISTORY_LIMIT = Number(process.env.CHAT_MAX_MESSAGES ?? 10);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const { message, guestKey, locale, productContext } = parsed.data;

  const session = await prisma.chatSession.upsert({
    where: { guestKey },
    update: { language: locale, ...(productContext ? { productContext } : {}) },
    create: { guestKey, language: locale, productContext },
  });

  const recentCount = await prisma.chatMessage.count({
    where: { sessionId: session.id, role: "USER", createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) } },
  });
  if (recentCount >= RATE_LIMIT_MAX) {
    return NextResponse.json({ error: "You're sending messages too quickly. Please wait a moment and try again." }, { status: 429 });
  }

  const priorMessages = await prisma.chatMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });
  const history: AIMessage[] = priorMessages
    .reverse()
    .map((m) => ({ role: m.role === "USER" ? "user" : m.role === "ASSISTANT" ? "assistant" : "system", content: m.content }));

  await prisma.chatMessage.create({ data: { sessionId: session.id, role: "USER", content: message } });
  await prisma.chatEvent.create({ data: { sessionId: session.id, type: "message_sent" } });

  let response;
  try {
    response = await runChatPipeline({ message, locale, sessionId: session.id, history, productContext: productContext ?? session.productContext ?? undefined });
  } catch (error) {
    return NextResponse.json({
      message: locale === "ar" ? "مساعد CELIBERY AI غير متاح مؤقتاً. يمكنك تصفح منتجاتنا أو التواصل مع الدعم." : "CELIBERY AI is temporarily unavailable. You can still browse our products or contact support.",
      intent: "unknown",
      products: [],
      actions: [],
      suggestedReplies: [],
      needsHumanHandoff: true,
      sessionId: session.id,
      error: error instanceof Error ? error.message : "unknown_error",
    }, { status: 200 });
  }

  await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      role: "ASSISTANT",
      content: response.message,
      metadata: {
        intent: response.intent,
        products: response.products,
        actions: response.actions,
        comparison: response.comparison,
        orderStatus: response.orderStatus,
        suggestedReplies: response.suggestedReplies,
        needsHumanHandoff: response.needsHumanHandoff,
      } as object,
    },
  });

  if (response.products.length > 0) {
    await prisma.chatEvent.create({ data: { sessionId: session.id, type: "product_recommended", metadata: { slugs: response.products.map((p) => p.slug) } } });
  }
  if (response.comparison) {
    await prisma.chatEvent.create({ data: { sessionId: session.id, type: "comparison_started", metadata: { slugs: response.comparison.products.map((p) => p.slug) } } });
  }
  if (response.intent === "order_status") {
    await prisma.chatEvent.create({ data: { sessionId: session.id, type: "order_lookup", metadata: { found: Boolean(response.orderStatus) } } });
  }
  if (response.needsHumanHandoff) {
    await prisma.chatEvent.create({ data: { sessionId: session.id, type: "support_handoff" } });
  }

  return NextResponse.json(response);
}
