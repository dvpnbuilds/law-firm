import { getServiceClient } from "./client";

export type Staff = {
  id: string;
  email: string;
  name: string;
};

export async function getStaffByEmail(email: string): Promise<Staff | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_staff")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function insertStaff(row: { id: string; email: string; name: string }): Promise<Staff> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_staff")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
