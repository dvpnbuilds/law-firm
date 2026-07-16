import { describe, expect, it } from "vitest";
import { listCaseTypes } from "@/lib/db/case-types";
import { generateChecklistForIntake } from "@/lib/ai/checklist";
import { createIntake, listIntakes } from "@/lib/db/intakes";
import { updateChecklistItemReceived } from "@/lib/db/checklists";
import { ensureRemindersForMissingItems, listReminders, markReminderSent } from "@/lib/db/reminders";

const canCallLive = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

describe.skipIf(!canCallLive)("dashboard (live DB)", () => {
  it("listIntakes includes newly created intakes", async () => {
    const intake = await createIntake();
    const intakes = await listIntakes();
    expect(intakes.some((i) => i.id === intake.id)).toBe(true);
  }, 30000);

  it("toggles a checklist item's received flag", async () => {
    const [caseType] = (await listCaseTypes()).filter((c) => c.slug !== "other");
    const intake = await createIntake();
    const checklist = await generateChecklistForIntake(intake.id, caseType.id);
    const item = checklist.items[0];

    const updated = await updateChecklistItemReceived(item.id, true);
    expect(updated.received).toBe(true);

    const reverted = await updateChecklistItemReceived(item.id, false);
    expect(reverted.received).toBe(false);
  }, 30000);

  it("auto-creates pending reminders for missing items and sending them updates the log", async () => {
    const [caseType] = (await listCaseTypes()).filter((c) => c.slug !== "other");
    const intake = await createIntake();
    const checklist = await generateChecklistForIntake(intake.id, caseType.id);

    await ensureRemindersForMissingItems(intake.id, checklist.items);
    const reminders = await listReminders(intake.id);
    expect(reminders.length).toBe(checklist.items.length);
    expect(reminders.every((r) => r.status === "pending")).toBe(true);

    // Idempotent: running again does not duplicate reminders.
    await ensureRemindersForMissingItems(intake.id, checklist.items);
    expect((await listReminders(intake.id)).length).toBe(checklist.items.length);

    const sent = await markReminderSent(reminders[0].id);
    expect(sent.status).toBe("sent");
    expect(sent.sent_at).not.toBeNull();

    // Marking an item received means it's no longer "missing" for future reminder runs.
    await updateChecklistItemReceived(checklist.items[1].id, true);
    const stillMissing = checklist.items.filter((i) => i.id !== checklist.items[1].id);
    await ensureRemindersForMissingItems(
      intake.id,
      stillMissing.map((i) => ({ ...i, received: false }))
    );
    expect((await listReminders(intake.id)).length).toBe(checklist.items.length);
  }, 30000);
});
