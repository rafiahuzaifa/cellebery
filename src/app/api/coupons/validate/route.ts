import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon } from "@/lib/coupons";

const schema = z.object({
  code: z.string().trim().min(1),
  subtotal: z.number().nonnegative(),
  email: z.string().trim().email().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const result = await validateCoupon(parsed.data.code, parsed.data.subtotal, parsed.data.email ?? "");
  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
  }
  return NextResponse.json({ valid: true, discount: result.discount });
}
