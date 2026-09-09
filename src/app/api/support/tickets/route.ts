import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const ticketSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  category: z.string().trim().min(1).max(60),
  guestEmail: z.string().trim().email().optional(),
  chatSessionId: z.string().trim().min(1).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ticketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({ data: parsed.data });

  if (parsed.data.chatSessionId) {
    await prisma.chatEvent.create({ data: { sessionId: parsed.data.chatSessionId, type: "support_handoff", metadata: { ticketId: ticket.id } } });
  }

  return NextResponse.json({ id: ticket.id, status: ticket.status });
}
