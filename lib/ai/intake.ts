import { createIntake, getIntake, updateIntake, type Intake } from "@/lib/db/intakes";
import { insertMessage } from "@/lib/db/messages";
import { listCaseTypes } from "@/lib/db/case-types";
import { classifyCaseType } from "./classify";
import { faqAnswer } from "./chat";
import { intakeDetailsSchema, type IntakeMessageResponse, type IntakeDetails } from "@/lib/schemas/intake";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Heuristic FAQ detection: a question mark signals the client is asking
// something rather than answering the current scripted step. Deterministic,
// matches the guardrail's regex-only approach — no extra LLM call needed.
function isFaqQuestion(message: string): boolean {
  return message.includes("?");
}

function nameToPrompt(name: string): string {
  return `Thanks, ${name}. And what's the best email to reach you at?`;
}

async function caseTypeIdForSlug(slug: string): Promise<string | null> {
  if (slug === "other") return null;
  const caseTypes = await listCaseTypes();
  return caseTypes.find((c) => c.slug === slug)?.id ?? null;
}

function caseTypeLabel(slug: string): string {
  return { personal_injury: "personal injury", family_law: "family law", immigration: "immigration" }[slug] ?? slug;
}

async function handleStep(
  intake: Intake,
  message: string
): Promise<{ reply: string; status: Intake["status"]; complete: boolean }> {
  const details = intakeDetailsSchema.parse(intake.details);

  if (details.step === "description") {
    const caseType = await classifyCaseType(message);
    const caseTypeId = await caseTypeIdForSlug(caseType);
    const nextDetails: IntakeDetails = { step: "name", description: message };
    await updateIntake(intake.id, { details: nextDetails, case_type_id: caseTypeId });
    const prefix =
      caseType === "other"
        ? "Thanks for sharing that. This sounds like something one of our attorneys should look at directly, so I've flagged it for a personal follow-up. "
        : `Got it — this sounds like a ${caseTypeLabel(caseType)} matter. `;
    return { reply: `${prefix}Could I get your full name?`, status: "in_progress", complete: false };
  }

  if (details.step === "name") {
    await updateIntake(intake.id, { client_name: message, details: { ...details, step: "email" } });
    return { reply: nameToPrompt(message), status: "in_progress", complete: false };
  }

  if (details.step === "email") {
    if (!EMAIL_RE.test(message.trim())) {
      return {
        reply: "That doesn't look like a valid email address — could you try again?",
        status: "in_progress",
        complete: false,
      };
    }
    await updateIntake(intake.id, { client_email: message.trim(), details: { ...details, step: "phone" } });
    return { reply: "And the best phone number for our team to reach you?", status: "in_progress", complete: false };
  }

  if (details.step === "phone") {
    const isHandoff = intake.case_type_id === null;
    const finalStatus: Intake["status"] = isHandoff ? "handoff" : "completed";
    await updateIntake(intake.id, {
      client_phone: message.trim(),
      status: finalStatus,
      details: { ...details, step: "done" },
    });
    const closing = isHandoff
      ? `Thanks — that's everything we need. Since your matter falls outside our core practice areas, one of our attorneys will personally follow up with you soon.`
      : `Thanks — that's everything we need for now. Our team will review your matter and follow up shortly. You can also book a free consultation using the scheduling link below.`;
    return { reply: closing, status: finalStatus, complete: true };
  }

  return {
    reply: "Your intake is complete — our team has everything they need and will be in touch soon.",
    status: intake.status,
    complete: true,
  };
}

export async function handleIntakeMessage(intakeId: string | null, message: string): Promise<IntakeMessageResponse> {
  const intake = intakeId ? await getIntake(intakeId) : null;
  const current = intake ?? (await createIntake());

  await insertMessage(current.id, "user", message);

  const details = intakeDetailsSchema.parse(current.details);

  if (details.step !== "description" && isFaqQuestion(message)) {
    const faq = await faqAnswer(message, current.case_type_id);
    const resumePrompt =
      details.step === "name"
        ? "Now, back to your intake — could I get your full name?"
        : details.step === "email"
          ? "Now, back to your intake — what's the best email to reach you at?"
          : "Now, back to your intake — what's the best phone number for our team to reach you?";
    const reply = `${faq.answer}\n\n${resumePrompt}`;
    await insertMessage(current.id, "assistant", reply);
    return { intakeId: current.id, reply, status: current.status as IntakeMessageResponse["status"], mode: "faq", complete: false };
  }

  const result = await handleStep(current, message);
  await insertMessage(current.id, "assistant", result.reply);
  return { intakeId: current.id, reply: result.reply, status: result.status as IntakeMessageResponse["status"], mode: "intake", complete: result.complete };
}
