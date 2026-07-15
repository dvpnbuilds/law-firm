import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { caseTypeSeedSchema, checklistTemplateItemSeedSchema, kbChunkSeedSchema } from "@/lib/schemas/seed";
import { caseTypes, checklistTemplates, kbChunks } from "@/lib/content/firm-content";

describe("seed content shape", () => {
  it("every case type matches the schema", () => {
    for (const row of caseTypes) {
      expect(() => caseTypeSeedSchema.parse(row)).not.toThrow();
    }
  });

  it("every checklist template item matches the schema", () => {
    for (const row of checklistTemplates) {
      expect(() => checklistTemplateItemSeedSchema.parse(row)).not.toThrow();
    }
  });

  it("every kb chunk matches the schema", () => {
    for (const row of kbChunks) {
      expect(() => kbChunkSeedSchema.parse(row)).not.toThrow();
    }
  });

  it("covers all 3 practice areas in case types", () => {
    const slugs = caseTypes.map((c) => c.slug).sort();
    expect(slugs).toEqual(["family_law", "immigration", "personal_injury"]);
  });

  it("every checklist template references a known case type", () => {
    const knownSlugs = new Set(caseTypes.map((c) => c.slug));
    for (const item of checklistTemplates) {
      expect(knownSlugs.has(item.caseTypeSlug)).toBe(true);
    }
  });

  it("every case-type-scoped kb chunk references a known case type", () => {
    const knownSlugs = new Set(caseTypes.map((c) => c.slug));
    for (const chunk of kbChunks) {
      if (chunk.caseTypeSlug) {
        expect(knownSlugs.has(chunk.caseTypeSlug)).toBe(true);
      }
    }
  });

  it("every case type has at least one checklist item and one kb chunk", () => {
    for (const caseType of caseTypes) {
      const hasChecklist = checklistTemplates.some((c) => c.caseTypeSlug === caseType.slug);
      const hasKbChunk = kbChunks.some((k) => k.caseTypeSlug === caseType.slug);
      expect(hasChecklist).toBe(true);
      expect(hasKbChunk).toBe(true);
    }
  });
});

describe("seeded database state", () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const skip = !url || !key;

  it.skipIf(skip)("case_types table has exactly the 3 seeded practice areas", async () => {
    const supabase = createClient(url!, key!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await supabase.from("lexintake_case_types").select("slug");
    expect(error).toBeNull();
    expect(data?.map((r) => r.slug).sort()).toEqual(["family_law", "immigration", "personal_injury"]);
  });

  it.skipIf(skip)("checklist_templates and kb_chunks are non-empty", async () => {
    const supabase = createClient(url!, key!, { auth: { autoRefreshToken: false, persistSession: false } });
    const [checklists, chunks] = await Promise.all([
      supabase.from("lexintake_checklist_templates").select("*", { count: "exact", head: true }),
      supabase.from("lexintake_kb_chunks").select("*", { count: "exact", head: true }),
    ]);
    expect(checklists.error).toBeNull();
    expect(chunks.error).toBeNull();
    expect(checklists.count).toBeGreaterThan(0);
    expect(chunks.count).toBeGreaterThan(0);
  });

  it.skipIf(skip)("demo staff account exists", async () => {
    const supabase = createClient(url!, key!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await supabase
      .from("lexintake_staff")
      .select("*")
      .eq("email", "staff@lexintake.demo")
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });
});
