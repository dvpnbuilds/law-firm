import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { toggleChecklistItemRequestSchema } from "@/lib/schemas/dashboard";
import { updateChecklistItemReceived } from "@/lib/db/checklists";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = toggleChecklistItemRequestSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const item = await updateChecklistItemReceived(params.id, body.data.received);
  return NextResponse.json(item);
}
