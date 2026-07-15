import { NextRequest, NextResponse } from "next/server";
import { faqRequestSchema } from "@/lib/schemas/chat";
import { faqAnswer } from "@/lib/ai/chat";

export async function POST(req: NextRequest) {
  const body = faqRequestSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const result = await faqAnswer(body.data.question, body.data.caseTypeId ?? null);
  return NextResponse.json(result);
}
