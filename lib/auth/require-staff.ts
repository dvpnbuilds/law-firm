import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStaffByEmail, type Staff } from "@/lib/db/staff";

export async function requireStaff(): Promise<Staff | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return getStaffByEmail(user.email);
}
