import { openrouterChat } from "./openrouter";
import { CHAT_MODEL } from "./models";
import { retrieveChunks } from "./retrieve";
import { checkGuardrail, HANDOFF_MESSAGE } from "./guardrail";
import type { FaqResponse } from "@/lib/schemas/chat";

const SYSTEM_PROMPT = `You are the intake assistant for Alden & Cross Legal, a fictional law firm.
Answer only general questions about the firm's process, fees, timelines, and policies, using ONLY the
context provided below. If the context doesn't contain the answer, say you don't have that information
and offer to connect the client with staff.

You must NEVER give legal advice, predict case outcomes, or tell the client what they should do about
their specific situation. If asked for legal advice, respond exactly with: "${HANDOFF_MESSAGE}"`;

export async function faqAnswer(question: string, caseTypeId: string | null = null): Promise<FaqResponse> {
  const questionCheck = checkGuardrail(question);
  if (questionCheck.refused) {
    return { answer: questionCheck.message, refused: true, citations: [] };
  }

  const chunks = await retrieveChunks(question, caseTypeId);
  const context = chunks.map((c) => `[${c.source_title}]\n${c.content}`).join("\n\n");

  const rawAnswer = await openrouterChat({
    model: CHAT_MODEL,
    system: `${SYSTEM_PROMPT}\n\nContext:\n${context}`,
    messages: [{ role: "user", content: question }],
  });

  const answerCheck = checkGuardrail(rawAnswer);
  if (answerCheck.refused) {
    return { answer: answerCheck.message, refused: true, citations: [] };
  }

  return { answer: rawAnswer, refused: false, citations: chunks.map((c) => c.source_title) };
}
