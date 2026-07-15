# LexIntake

AI intake assistant demo for a fictional law firm: chat widget (conversational intake, case-type routing, RAG FAQ, document checklist, Calendly booking) plus staff dashboard (intake summaries, checklist tracking, simulated reminder queue). Portfolio piece — must deploy free and demo end-to-end.

## Stack
- Next.js 14 (App Router) + TypeScript — one codebase: widget, chat, dashboard, API routes
- Supabase: Postgres + pgvector (RAG store), Supabase Auth (staff login only)
- Claude API — Haiku for classification and chat (keep demo costs near zero)
- Embeddings: decided in Phase 2 (OpenAI text-embedding-3-small or Voyage) — log choice in PROGRESS.md
- Deploy: Vercel free tier

## Commands
- `dev`: npm run dev
- `test`: npm test
- `build`: npm run build
- `seed`: npm run seed (fictional firm content + demo intakes)

## Conventions
- App Router, server components by default; client components only where interactive
- All DB access through `lib/db/` repository functions — no inline Supabase queries in routes/components
- All LLM calls through `lib/ai/` — one module per concern (classify, chat, checklist, summarize)
- Zod schemas in `lib/schemas/` for every intake payload and every LLM structured output
- Chat widget at `/widget` (embedded via iframe snippet); dashboard at `/dashboard`

## Workflow
- Read PLAN.md for scope and phases; PROGRESS.md for current state; RULES.md before writing code.
- Work strictly one phase at a time. After finishing a phase, run the audit-phase skill.

## Key context
- UPL guardrail is non-negotiable: the assistant NEVER gives legal advice — firm/process info only. Guardrail = system prompt + refusal check on every chat response. It is a demo selling point; surface it in the UI.
- Intake flow is scripted-with-flex: the LLM fills a fixed Zod schema through a guided conversation — never fully open-ended.
- Three practice areas: personal injury, family law, immigration. Everything else → "other" + human-handoff message.
- Firm content is fictional (Phase 1 seed). No real client data anywhere.
- Reminders are SIMULATED: reminders table with status transitions and a visible send log — no real email/SMS.
- Booking = Calendly embed, not a custom scheduler.
