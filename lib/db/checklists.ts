import { getServiceClient } from "./client";

export type ChecklistItem = {
  id: string;
  checklist_id: string;
  label: string;
  received: boolean;
  sort_order: number;
};

export type Checklist = {
  id: string;
  intake_id: string;
  created_at: string;
  items: ChecklistItem[];
};

export async function createChecklist(
  intakeId: string,
  items: { label: string; sort_order: number }[]
): Promise<Checklist> {
  const supabase = getServiceClient();
  const { data: checklist, error } = await supabase
    .from("lexintake_checklists")
    .insert({ intake_id: intakeId })
    .select()
    .single();
  if (error) throw error;

  if (items.length === 0) return { ...checklist, items: [] };

  const { data: itemRows, error: itemError } = await supabase
    .from("lexintake_checklist_items")
    .insert(items.map((i) => ({ checklist_id: checklist.id, ...i })))
    .select();
  if (itemError) throw itemError;

  return { ...checklist, items: itemRows };
}

export async function updateChecklistItemReceived(id: string, received: boolean): Promise<ChecklistItem> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_checklist_items")
    .update({ received })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getChecklistByIntake(intakeId: string): Promise<Checklist | null> {
  const supabase = getServiceClient();
  const { data: checklist, error } = await supabase
    .from("lexintake_checklists")
    .select("*")
    .eq("intake_id", intakeId)
    .maybeSingle();
  if (error) throw error;
  if (!checklist) return null;

  const { data: items, error: itemError } = await supabase
    .from("lexintake_checklist_items")
    .select("*")
    .eq("checklist_id", checklist.id)
    .order("sort_order");
  if (itemError) throw itemError;

  return { ...checklist, items };
}
