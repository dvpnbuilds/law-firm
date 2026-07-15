import { NextRequest, NextResponse } from "next/server";
import { intakeMessageRequestSchema } from "@/lib/schemas/intake";
import { handleIntakeMessage } from "@/lib/ai/intake";

export async function POST(req: NextRequest) {
  const body = intakeMessageRequestSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const result = await handleIntakeMessage(body.data.intakeId, body.data.message);
  return NextResponse.json(result);
}
