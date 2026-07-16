import { getServiceClient } from "./client";

export type Reminder = {
  id: string;
  intake_id: string;
  checklist_item_id: string | null;
  status: "pending" | "sent";
  message: string;
  created_at: string;
  sent_at: string | null;
};

export async function listReminders(intakeId: string): Promise<Reminder[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_reminders")
    .select("*")
    .eq("intake_id", intakeId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createReminder(
  intakeId: string,
  checklistItemId: string,
  message: string
): Promise<Reminder> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_reminders")
    .insert({ intake_id: intakeId, checklist_item_id: checklistItemId, message })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function ensureRemindersForMissingItems(
  intakeId: string,
  items: { id: string; label: string; received: boolean }[]
): Promise<void> {
  const existing = await listReminders(intakeId);
  const existingItemIds = new Set(existing.map((r) => r.checklist_item_id));
  const missing = items.filter((i) => !i.received && !existingItemIds.has(i.id));
  for (const item of missing) {
    await createReminder(intakeId, item.id, `Reminder: please send us your ${item.label.toLowerCase()}.`);
  }
}

export async function markReminderSent(id: string): Promise<Reminder> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_reminders")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
