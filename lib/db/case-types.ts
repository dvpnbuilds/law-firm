import { getServiceClient } from "./client";
import type { CaseTypeSeed } from "@/lib/schemas/seed";

export type CaseType = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export async function listCaseTypes(): Promise<CaseType[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("lexintake_case_types").select("*");
  if (error) throw error;
  return data;
}

export async function insertCaseTypes(rows: CaseTypeSeed[]): Promise<CaseType[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lexintake_case_types")
    .upsert(rows, { onConflict: "slug" })
    .select();
  if (error) throw error;
  return data;
}
