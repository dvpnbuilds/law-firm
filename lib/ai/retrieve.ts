import { embedText } from "./embed";
import { matchKbChunks, type MatchedKbChunk } from "@/lib/db/kb-chunks";

const TOP_K = 5;

export async function retrieveChunks(
  query: string,
  caseTypeId: string | null = null
): Promise<MatchedKbChunk[]> {
  const queryEmbedding = await embedText(query);
  return matchKbChunks(queryEmbedding, caseTypeId, TOP_K);
}
