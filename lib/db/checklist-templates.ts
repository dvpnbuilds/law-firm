import { getServiceClient } from "./client";

export type ChecklistTemplateItem = {
  id: string;
  case_type_id: string;
  label: string;
  sort_order: number;
};

export async function listChecklistTemplates(): Promise<ChecklistTemplateItem[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("lexintake_checklist_templates").select("*");
  if (error) throw error;
  return data;
}

export async function insertChecklistTemplateItems(
  rows: { case_type_id: string; label: string; sort_order: number }[]
): Promise<ChecklistTemplateItem[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_checklist_templates")
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
}
