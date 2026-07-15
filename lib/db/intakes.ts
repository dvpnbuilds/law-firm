import { getServiceClient } from "./client";
import type { IntakeDetails } from "@/lib/schemas/intake";

export type Intake = {
  id: string;
  case_type_id: string | null;
  status: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  details: IntakeDetails;
  summary: string | null;
  created_at: string;
  updated_at: string;
};

export async function createIntake(): Promise<Intake> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_intakes")
    .insert({ details: { step: "description" } })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getIntake(id: string): Promise<Intake | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("lexintake_intakes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateIntake(
  id: string,
  patch: Partial<
    Pick<Intake, "case_type_id" | "status" | "client_name" | "client_email" | "client_phone" | "details" | "summary">
  >
): Promise<Intake> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_intakes")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
