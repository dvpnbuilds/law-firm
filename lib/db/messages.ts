import { getServiceClient } from "./client";

export type IntakeMessage = {
  id: string;
  intake_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export async function insertMessage(
  intakeId: string,
  role: "user" | "assistant" | "system",
  content: string
): Promise<IntakeMessage> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_messages")
    .insert({ intake_id: intakeId, role, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listMessages(intakeId: string): Promise<IntakeMessage[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_messages")
    .select("*")
    .eq("intake_id", intakeId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}
