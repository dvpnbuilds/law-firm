import { openrouterChat } from "./openrouter";
import { CHAT_MODEL } from "./models";
import { classificationSchema, type Classification } from "@/lib/schemas/intake";

const CLASSIFY_SYSTEM_PROMPT = `You classify a prospective client's legal issue into exactly one of Alden & Cross Legal's practice areas based on their description.

Categories:
- personal_injury: car accidents, slip-and-fall, injuries caused by someone else's negligence
- family_law: divorce, custody, child support, other family matters
- immigration: visas, green cards, naturalization, other immigration matters
- other: anything that does not clearly fit the three categories above

Respond with ONLY a JSON object and nothing else, in this exact form: {"caseType": "personal_injury" | "family_law" | "immigration" | "other"}`;

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenced ? fenced[1] : raw).trim();
}

// Zod-validated structured output with a single retry, falling back to
// "other" (human handoff) on repeated failure — RULES.md rule 7.
export async function classifyCaseType(description: string): Promise<Classification["caseType"]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await openrouterChat({
        model: CHAT_MODEL,
        system: CLASSIFY_SYSTEM_PROMPT,
        messages: [{ role: "user", content: description }],
      });
      const parsed = classificationSchema.parse(JSON.parse(extractJson(raw)));
      return parsed.caseType;
    } catch {
      continue;
    }
  }
  return "other";
}
