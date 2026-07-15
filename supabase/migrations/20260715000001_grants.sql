-- Explicit grants for lexintake_* tables. RLS (no policies) still blocks
-- anon/authenticated row access; this only lets PostgREST route requests
-- to these tables at all (service_role needs write grants to bypass RLS).

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on
  lexintake_case_types,
  lexintake_staff,
  lexintake_intakes,
  lexintake_messages,
  lexintake_checklist_templates,
  lexintake_checklists,
  lexintake_checklist_items,
  lexintake_reminders,
  lexintake_kb_chunks
to anon, authenticated, service_role;

notify pgrst, 'reload schema';
