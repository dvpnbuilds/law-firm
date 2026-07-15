import { getServiceClient } from "./client";

export type KbChunk = {
  id: string;
  case_type_id: string | null;
  source_title: string;
  content: string;
  embedding: number[] | null;
};

export async function listKbChunks(): Promise<KbChunk[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("lexintake_kb_chunks").select("*");
  if (error) throw error;
  return data;
}

export async function insertKbChunks(
  rows: { case_type_id: string | null; source_title: string; content: string }[]
): Promise<KbChunk[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("lexintake_kb_chunks").insert(rows).select();
  if (error) throw error;
  return data;
}

export async function listKbChunksMissingEmbedding(): Promise<KbChunk[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("lexintake_kb_chunks").select("*").is("embedding", null);
  if (error) throw error;
  return data;
}

export async function updateKbChunkEmbedding(id: string, embedding: number[]): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("lexintake_kb_chunks").update({ embedding }).eq("id", id);
  if (error) throw error;
}

export type MatchedKbChunk = {
  id: string;
  case_type_id: string | null;
  source_title: string;
  content: string;
  similarity: number;
};

export async function matchKbChunks(
  queryEmbedding: number[],
  caseTypeId: string | null,
  matchCount: number
): Promise<MatchedKbChunk[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("match_kb_chunks", {
    query_embedding: queryEmbedding,
    match_case_type_id: caseTypeId,
    match_count: matchCount,
  });
  if (error) throw error;
  return data;
}
