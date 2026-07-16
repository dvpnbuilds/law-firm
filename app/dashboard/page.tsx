import { redirect } from "next/navigation";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/require-staff";
import { listIntakes } from "@/lib/db/intakes";
import { listCaseTypes } from "@/lib/db/case-types";
import SignOutButton from "./sign-out-button";

const STATUS_LABEL: Record<string, string> = {
  in_progress: "In progress",
  completed: "Completed",
  handoff: "Handoff",
};

export default async function DashboardPage() {
  const staff = await requireStaff();
  if (!staff) redirect("/login");

  const [intakes, caseTypes] = await Promise.all([listIntakes(), listCaseTypes()]);
  const caseTypeNameById = new Map(caseTypes.map((c) => [c.id, c.name]));

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">LexIntake Dashboard</h1>
        <SignOutButton />
      </div>
      <p className="text-sm text-gray-500">Signed in as {staff.name} ({staff.email})</p>

      {intakes.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed p-12 text-center text-gray-500">No intakes yet.</div>
      ) : (
        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2">Client</th>
              <th className="py-2">Case type</th>
              <th className="py-2">Status</th>
              <th className="py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {intakes.map((intake) => (
              <tr key={intake.id} className="border-b">
                <td className="py-2">
                  <Link href={`/dashboard/${intake.id}`} className="text-black underline">
                    {intake.client_name || "(unnamed)"}
                  </Link>
                </td>
                <td className="py-2">
                  {intake.case_type_id ? caseTypeNameById.get(intake.case_type_id) || "—" : "—"}
                </td>
                <td className="py-2">{STATUS_LABEL[intake.status] || intake.status}</td>
                <td className="py-2">{new Date(intake.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
