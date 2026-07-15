import { describe, expect, it } from "vitest";
import { classifyCaseType } from "@/lib/ai/classify";
import { handleIntakeMessage } from "@/lib/ai/intake";
import { getIntake } from "@/lib/db/intakes";

const canCallLive = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const canCallLlm = canCallLive && !!process.env.OPENROUTER_API_KEY;

describe.skipIf(!canCallLlm)("case-type classification (live LLM)", () => {
  const cases: { description: string; expected: string }[] = [
    { description: "I was rear-ended by a drunk driver and broke my arm.", expected: "personal_injury" },
    { description: "I slipped on a wet floor at a grocery store and hurt my back.", expected: "personal_injury" },
    { description: "A dog bit me while I was walking in my neighbor's yard.", expected: "personal_injury" },
    { description: "I want to file for divorce from my spouse of 10 years.", expected: "family_law" },
    { description: "I'm trying to get custody of my kids after my separation.", expected: "family_law" },
    { description: "My ex stopped paying child support and I need help enforcing it.", expected: "family_law" },
    { description: "I need help applying for a green card through my employer.", expected: "immigration" },
    { description: "I want to bring my spouse to the US on a family visa.", expected: "immigration" },
    { description: "I'm applying for naturalization and need help with the process.", expected: "immigration" },
    { description: "My neighbor's tree fell on my roof and damaged it.", expected: "other" },
    { description: "I want to write a will and set up a trust for my kids.", expected: "other" },
    { description: "I'm starting a small business and need a contract reviewed.", expected: "other" },
  ];

  it("classifies at least 10 of 12 sample descriptions correctly", async () => {
    const results = await Promise.all(cases.map((c) => classifyCaseType(c.description)));
    const correct = results.filter((r, i) => r === cases[i].expected).length;
    expect(correct).toBeGreaterThanOrEqual(10);
  }, 60000);
});

describe.skipIf(!canCallLlm)("full simulated intake (live LLM + DB)", () => {
  const scenarios: { description: string; expectStatus: "completed" | "handoff" }[] = [
    { description: "I was hit by a car while crossing the street and injured my leg.", expectStatus: "completed" },
    { description: "I need to file for divorce and figure out custody of my children.", expectStatus: "completed" },
    { description: "I'm applying for a work visa and need legal help.", expectStatus: "completed" },
    { description: "My landlord won't return my security deposit.", expectStatus: "handoff" },
  ];

  it.each(scenarios)("produces a complete valid intake record: $description", async ({ description, expectStatus }) => {
    let intakeId: string | null = null;

    let res = await handleIntakeMessage(intakeId, description);
    intakeId = res.intakeId;
    expect(res.complete).toBe(false);

    res = await handleIntakeMessage(intakeId, "Jane Doe");
    expect(res.complete).toBe(false);

    res = await handleIntakeMessage(intakeId, "jane@example.com");
    expect(res.complete).toBe(false);

    res = await handleIntakeMessage(intakeId, "555-123-4567");
    expect(res.complete).toBe(true);
    expect(res.status).toBe(expectStatus);

    const intake = await getIntake(intakeId);
    expect(intake).not.toBeNull();
    expect(intake!.client_name).toBe("Jane Doe");
    expect(intake!.client_email).toBe("jane@example.com");
    expect(intake!.client_phone).toBe("555-123-4567");
    expect(intake!.status).toBe(expectStatus);
  }, 60000);
});

describe.skipIf(!canCallLlm)("mid-conversation FAQ switch (live LLM + DB)", () => {
  it("answers an FAQ question mid-intake, then resumes the intake step", async () => {
    let res = await handleIntakeMessage(null, "I was in a car accident and need help with my claim.");
    const intakeId = res.intakeId;
    expect(res.mode).toBe("intake");

    res = await handleIntakeMessage(intakeId, "What are your office hours?");
    expect(res.mode).toBe("faq");
    expect(res.complete).toBe(false);
    expect(res.reply.toLowerCase()).toContain("back to your intake");

    res = await handleIntakeMessage(intakeId, "Jane Doe");
    expect(res.mode).toBe("intake");
    expect(res.complete).toBe(false);
  }, 60000);
});
