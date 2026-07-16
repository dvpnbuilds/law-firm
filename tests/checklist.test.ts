import { describe, expect, it } from "vitest";
import { listCaseTypes } from "@/lib/db/case-types";
import { listChecklistTemplates } from "@/lib/db/checklist-templates";
import { generateChecklistForIntake } from "@/lib/ai/checklist";
import { createIntake } from "@/lib/db/intakes";

const canCallLive = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

describe.skipIf(!canCallLive)("checklist generation (live DB)", () => {
  it("generates a checklist matching the templates for each case type", async () => {
    const caseTypes = await listCaseTypes();
    const templates = await listChecklistTemplates();

    for (const caseType of caseTypes.filter((c) => c.slug !== "other")) {
      const intake = await createIntake();
      const checklist = await generateChecklistForIntake(intake.id, caseType.id);

      const expectedLabels = templates
        .filter((t) => t.case_type_id === caseType.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((t) => t.label);

      expect(checklist.items.map((i) => i.label)).toEqual(expectedLabels);
      expect(checklist.items.length).toBeGreaterThan(0);
      expect(checklist.items.every((i) => i.received === false)).toBe(true);
    }
  }, 30000);
});
