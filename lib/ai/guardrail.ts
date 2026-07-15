// UPL guardrail (RULES.md rule 6): no code path may return legal advice.
// Every chat endpoint must call checkGuardrail — on the incoming question
// before calling the LLM, and again on the LLM's answer before returning it.
// Never bypass this, even in tests.

export const HANDOFF_MESSAGE =
  "That's a question about your specific legal situation, which I'm not able to advise on as an AI assistant — only a licensed attorney can. I've flagged this for one of our attorneys to follow up with you personally. In the meantime, I'm happy to answer general questions about our process, fees, or timelines.";

// Normalize contractions ("I'll", "I'm", "what's") so patterns don't need to
// account for both forms separately.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\bi'll\b/g, "i will")
    .replace(/\bi'm\b/g, "i am")
    .replace(/\bi've\b/g, "i have")
    .replace(/\bwhat's\b/g, "what is");
}

// Patterns that indicate the user is asking for advice on their specific
// situation (outcome prediction, what-should-I-do, liability/merits) rather
// than general firm/process info. Gaps use bounded wildcards (.{0,N}) rather
// than rigid adjacent phrasing so realistic rephrasing ("my personal injury
// case", "do you think I'll win") still matches.
const ADVICE_SEEKING_PATTERNS: RegExp[] = [
  /\bshould i\b.{0,20}\b(sue|settle|accept|take|plead|file|sign|fire|fight)\b/i,
  /\bwhat (should|would) i do\b/i,
  /\b(what are|do i have)\b.{0,10}\b(my|a) chances\b/i,
  /\bchances\b.{0,20}\b(win|winning|success|custody)\b/i,
  /\bi (will|am|would|might)\b.{0,15}\b(win|lose|liable|at fault|guilty)\b/i,
  /\b(will|would|am) i\b.{0,15}\b(win|lose|liable|at fault|guilty)\b/i,
  /\b(case|claim|matter)\b.{0,20}\bworth\b/i,
  /\bworth\b.{0,20}\b(case|claim|matter)\b/i,
  /\bhow much\b.{0,30}\b(worth|can i get|can i sue for|will i (get|receive|win))\b/i,
  /\bis (it|this) worth (suing|it)\b/i,
  /\b(should i|can i|will i)\b.{0,20}\b(get (full )?custody|sue|take legal action)\b/i,
  /\bbest (strategy|move|option)\b.{0,20}\b(my case|my situation)\b/i,
  /\b(is|does) (this|my)\b.{0,20}\b(legal|illegal|actionable)\b/i,
];

// Phrases that indicate the model gave advice anyway, despite the system
// prompt — a backup net over the LLM's raw output.
const ADVICE_GIVING_PATTERNS: RegExp[] = [
  /you (should|would likely|will probably|are likely to) (win|lose|sue|settle|accept)/i,
  /i (recommend|advise) (that )?you/i,
  /your chances (are|of winning)/i,
  /in your case, you should/i,
];

export type GuardrailResult = { refused: boolean; message: string };

export function checkGuardrail(text: string): GuardrailResult {
  if (text.includes(HANDOFF_MESSAGE)) return { refused: true, message: HANDOFF_MESSAGE };
  const normalized = normalize(text);
  const flagged = [...ADVICE_SEEKING_PATTERNS, ...ADVICE_GIVING_PATTERNS].some((pattern) =>
    pattern.test(normalized)
  );
  return flagged ? { refused: true, message: HANDOFF_MESSAGE } : { refused: false, message: text };
}
