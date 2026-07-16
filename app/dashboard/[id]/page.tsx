import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/require-staff";
import { getIntake } from "@/lib/db/intakes";
import { getChecklistByIntake } from "@/lib/db/checklists";
import { listReminders, ensureRemindersForMissingItems } from "@/lib/db/reminders";
import ChecklistItemToggle from "./checklist-item-toggle";
import SendReminderButton from "./send-reminder-button";

export default async function IntakeDetailPage({ params }: { params: { id: string } }) {
  const staff = await requireStaff();
  if (!staff) redirect("/login");

  const intake = await getIntake(params.id);
  if (!intake) notFound();

  const checklist = await getChecklistByIntake(intake.id);
  if (checklist && checklist.items.length > 0) {
    await ensureRemindersForMissingItems(intake.id, checklist.items);
  }
  const reminders = await listReminders(intake.id);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/dashboard" className="text-sm text-gray-500 underline">
        ← All intakes
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{intake.client_name || "(unnamed)"}</h1>
      <p className="text-sm text-gray-500">
        {intake.client_email} {intake.client_phone && `· ${intake.client_phone}`} · {intake.status}
      </p>

      {intake.summary && (
        <section className="mt-6">
          <h2 className="mb-1 font-semibold">Summary</h2>
          <p className="text-sm text-gray-700">{intake.summary}</p>
        </section>
      )}

      {checklist && checklist.items.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-semibold">Document checklist</h2>
          <div className="space-y-2">
            {checklist.items.map((item) => (
              <ChecklistItemToggle key={item.id} id={item.id} label={item.label} received={item.received} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 font-semibold">Reminders</h2>
        {reminders.length === 0 ? (
          <p className="text-sm text-gray-500">No reminders.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {reminders.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded border px-3 py-2">
                <span>
                  {r.message}
                  <span className="ml-2 text-xs text-gray-500">
                    {r.status === "sent" ? `sent ${new Date(r.sent_at!).toLocaleString()}` : "pending"}
                  </span>
                </span>
                {r.status === "pending" && <SendReminderButton id={r.id} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
