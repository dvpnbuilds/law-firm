import { config } from "dotenv";
config({ path: ".env.local" });
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { caseTypeSeedSchema, checklistTemplateItemSeedSchema, kbChunkSeedSchema } from "@/lib/schemas/seed";
import { caseTypes, checklistTemplates, kbChunks } from "@/lib/content/firm-content";
import { insertCaseTypes } from "@/lib/db/case-types";
import { insertChecklistTemplateItems, listChecklistTemplates } from "@/lib/db/checklist-templates";
import { insertKbChunks, listKbChunks } from "@/lib/db/kb-chunks";
import { insertStaff } from "@/lib/db/staff";

const DEMO_STAFF_EMAIL = "staff@lexintake.demo";

async function seedCaseTypes() {
  const validated = caseTypes.map((row) => caseTypeSeedSchema.parse(row));
  const inserted = await insertCaseTypes(validated);
  console.log(`case_types: ${inserted.length} rows`);
  return inserted;
}

async function seedChecklistTemplates(caseTypeBySlug: Map<string, string>) {
  if ((await listChecklistTemplates()).length > 0) {
    console.log("checklist_templates: already seeded, skipping");
    return;
  }
  const validated = checklistTemplates.map((row) => checklistTemplateItemSeedSchema.parse(row));
  const rows = validated.map((row) => {
    const caseTypeId = caseTypeBySlug.get(row.caseTypeSlug);
    if (!caseTypeId) throw new Error(`Unknown case type slug: ${row.caseTypeSlug}`);
    return { case_type_id: caseTypeId, label: row.label, sort_order: row.sortOrder };
  });
  const inserted = await insertChecklistTemplateItems(rows);
  console.log(`checklist_templates: ${inserted.length} rows`);
}

async function seedKbChunks(caseTypeBySlug: Map<string, string>) {
  if ((await listKbChunks()).length > 0) {
    console.log("kb_chunks: already seeded, skipping");
    return;
  }
  const validated = kbChunks.map((row) => kbChunkSeedSchema.parse(row));
  const rows = validated.map((row) => ({
    case_type_id: row.caseTypeSlug ? caseTypeBySlug.get(row.caseTypeSlug) ?? null : null,
    source_title: row.sourceTitle,
    content: row.content,
  }));
  const inserted = await insertKbChunks(rows);
  console.log(`kb_chunks: ${inserted.length} rows`);
}

async function seedDemoStaff() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users.find((u) => u.email === DEMO_STAFF_EMAIL);

  if (found) {
    await insertStaff({ id: found.id, email: DEMO_STAFF_EMAIL, name: "Demo Staff" });
    console.log(`staff: reused existing auth user (${DEMO_STAFF_EMAIL})`);
    return;
  }

  const password = randomBytes(9).toString("base64url");
  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_STAFF_EMAIL,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("Failed to create demo staff auth user");

  await insertStaff({ id: data.user.id, email: DEMO_STAFF_EMAIL, name: "Demo Staff" });
  console.log(`staff: created ${DEMO_STAFF_EMAIL} / password: ${password}`);
}

async function main() {
  const caseTypeRows = await seedCaseTypes();
  const caseTypeBySlug = new Map(caseTypeRows.map((row) => [row.slug, row.id]));

  await seedChecklistTemplates(caseTypeBySlug);
  await seedKbChunks(caseTypeBySlug);
  await seedDemoStaff();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
