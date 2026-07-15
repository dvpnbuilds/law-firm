import { config } from "dotenv";
config({ path: ".env.local" });

import { listKbChunksMissingEmbedding, updateKbChunkEmbedding } from "@/lib/db/kb-chunks";
import { embedText } from "@/lib/ai/embed";

async function main() {
  const chunks = await listKbChunksMissingEmbedding();
  if (chunks.length === 0) {
    console.log("kb_chunks: all rows already embedded, skipping");
    return;
  }
  for (const chunk of chunks) {
    const embedding = await embedText(chunk.content);
    await updateKbChunkEmbedding(chunk.id, embedding);
  }
  console.log(`kb_chunks: embedded ${chunks.length} rows`);
}

main().catch((err) => {
  console.error("Embed failed:", err);
  process.exit(1);
});
