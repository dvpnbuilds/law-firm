import { listChecklistTemplates } from "@/lib/db/checklist-templates";
import { createChecklist, type Checklist } from "@/lib/db/checklists";

export async function generateChecklistForIntake(intakeId: string, caseTypeId: string): Promise<Checklist> {
  const templates = await listChecklistTemplates();
  const items = templates
    .filter((t) => t.case_type_id === caseTypeId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((t) => ({ label: t.label, sort_order: t.sort_order }));

  return createChecklist(intakeId, items);
}
