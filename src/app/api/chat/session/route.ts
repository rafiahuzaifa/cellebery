import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const guestKeySchema = z.string().trim().min(8).max(100);

export async function GET(request: Request) {
  const guestKey = new URL(request.url).searchParams.get("guestKey");
  const parsed = guestKeySchema.safeParse(guestKey);
  if (!parsed.success) return NextResponse.json({ error: "Invalid guestKey" }, { status: 400 });

  const session = await prisma.chatSession.findUnique({
    where: { guestKey: parsed.data },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) return NextResponse.json({ sessionId: null, messages: [] });

  return NextResponse.json({
    sessionId: session.id,
    messages: session.messages.map((m) => ({
      id: m.id,
      role: m.role.toLowerCase(),
      content: m.content,
      metadata: m.metadata,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function DELETE(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = z.object({ guestKey: guestKeySchema }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const session = await prisma.chatSession.findUnique({ where: { guestKey: parsed.data.guestKey } });
  if (session) {
    await prisma.chatMessage.deleteMany({ where: { sessionId: session.id } });
    await prisma.chatSession.update({ where: { id: session.id }, data: { context: Prisma.DbNull, title: null } });
  }

  return NextResponse.json({ ok: true });
}
