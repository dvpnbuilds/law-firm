import { z } from "zod";
import { openrouterChat } from "./openrouter";
import { CHAT_MODEL } from "./models";

const SUMMARIZE_SYSTEM_PROMPT = `You write a short internal staff-facing summary of a new legal intake for Alden & Cross Legal, for a staff dashboard. State only the facts given — client name, matter type, and what they described. Do not give a legal opinion, assess the merits of the matter, or predict an outcome. One or two plain sentences, no preamble, no markdown.`;

const summarySchema = z.string().trim().min(1);

function fallbackSummary(clientName: string | null, matterLabel: string, description: string): string {
  return `${clientName ?? "Client"} — ${matterLabel}. Description: ${description}`;
}

// Zod-validated free-text output with a single retry, falling back to a
// deterministic template on repeated failure — RULES.md rule 7.
export async function summarizeIntake(
  clientName: string | null,
  matterLabel: string,
  description: string
): Promise<string> {
  const fallback = fallbackSummary(clientName, matterLabel, description);
  const userPrompt = `Client name: ${clientName ?? "(not provided)"}\nMatter type: ${matterLabel}\nClient's description: ${description}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await openrouterChat({
        model: CHAT_MODEL,
        system: SUMMARIZE_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });
      return summarySchema.parse(raw);
    } catch {
      continue;
    }
  }
  return fallback;
}
