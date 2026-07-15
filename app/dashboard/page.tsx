import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStaffByEmail } from "@/lib/db/staff";
import SignOutButton from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const staff = await getStaffByEmail(user.email);
  if (!staff) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">LexIntake Dashboard</h1>
        <SignOutButton />
      </div>
      <p className="text-sm text-gray-500">Signed in as {staff.name} ({staff.email})</p>
      <div className="mt-8 rounded-lg border border-dashed p-12 text-center text-gray-500">
        No intakes yet.
      </div>
    </main>
  );
}
