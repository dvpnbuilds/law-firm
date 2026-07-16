import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { markReminderSent } from "@/lib/db/reminders";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reminder = await markReminderSent(params.id);
  return NextResponse.json(reminder);
}
