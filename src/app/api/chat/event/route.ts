import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const EVENT_TYPES = [
  "chat_opened",
  "chat_closed",
  "product_clicked",
  "product_added_to_cart",
  "comparison_started",
  "order_lookup",
] as const;

const schema = z.object({
  guestKey: z.string().trim().min(8).max(100),
  type: z.enum(EVENT_TYPES),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/** Lightweight client-side event logging for interactions the server can't otherwise see
 * (opening the panel, clicking a product card, etc.) — feeds the admin analytics dashboard.
 * Best-effort: never blocks or errors visibly to the customer. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  // Upsert rather than find-only: an event (e.g. chat_opened) can legitimately be the
  // very first thing that happens in a session, before any message is sent.
  const session = await prisma.chatSession.upsert({
    where: { guestKey: parsed.data.guestKey },
    update: {},
    create: { guestKey: parsed.data.guestKey },
  });

  await prisma.chatEvent.create({
    data: { sessionId: session.id, type: parsed.data.type, metadata: parsed.data.metadata as object | undefined },
  });

  return NextResponse.json({ ok: true });
}
