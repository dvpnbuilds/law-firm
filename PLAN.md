# LexIntake — Plan (approved 2026-07-07)

## Vision
A demo-ready AI intake assistant for a fictional law firm: a website chat widget that conversationally intakes new clients, classifies their case, answers firm FAQs via RAG, generates a document checklist, and books a consult — plus a staff dashboard with structured intake summaries and a simulated follow-up queue. Built as a portfolio piece to showcase RAG + AI workflow automation to prospective clients.

## Core features (v1)
- Conversational intake — guided chat fills a fixed intake schema (scripted-with-flex)
- Case-type routing — LLM classifies into personal injury / family law / immigration / other→human handoff
- RAG FAQ chatbot — answers firm/process questions over seeded fictional firm docs, with UPL guardrails
- Document checklist — auto-generated per case type, shown to client and tracked in dashboard
- Booking — Calendly embed step at end of intake
- Staff dashboard — intake list, AI intake summary per intake, checklist tracking
- Follow-up reminders — simulated queue with status log (no real sending)

## Deferred (not v1)
- Real email/SMS sending — demo simulates it; production plumbing adds no demo value
- Multi-firm tenancy — single fictional firm is enough to sell the concept
- Client auth/accounts — intake is anonymous-friendly
- Document upload analysis, conflict checking — v2 upsells

## Stack
Next.js 14 + TypeScript on Vercel; Supabase (Postgres + pgvector + staff auth); Claude Haiku for classify/chat. One codebase, free hosting, near-zero LLM cost — right for a portfolio demo.

## Phases
### Phase 1: Foundation
- Scope: Next.js scaffold, Supabase schema (intakes, messages, case_types, checklists, checklist_items, reminders, documents/kb_chunks), seed script with fictional firm content (3 practice areas: FAQs, process pages, checklist templates), staff login via Supabase Auth.
- Done when: `npm run dev` serves the app; `npm run seed` populates all tables; staff can log in and see an empty dashboard shell; schema matches the features above; tests cover seed integrity.

### Phase 2: RAG pipeline
- Scope: chunk + embed seeded docs into pgvector; retrieval API; FAQ chat endpoint using retrieved context; UPL guardrail (system prompt + refusal layer); embedding model decision logged.
- Done when: 10 scripted test queries return grounded answers citing seeded content; 5 legal-advice bait queries are refused with the handoff message; retrieval unit tests pass.

### Phase 3: Intake conversation
- Scope: chat widget UI at /widget; guided intake conversation filling the Zod intake schema; case-type classification with other→handoff; intake record + messages persisted; mid-conversation switch between intake and FAQ modes.
- Done when: a full simulated intake (each practice area + one "other") produces a complete, valid intake record; classification test set (12 sample descriptions) ≥10 correct; FAQ questions mid-intake are answered then intake resumes.

### Phase 4: Checklist + booking
- Scope: checklist generation per case type from templates + intake details; client-facing checklist/summary screen at end of intake; Calendly iframe embed step; checklist persisted for dashboard.
- Done when: each case type yields a correct checklist tied to the intake; the client end-screen shows summary + checklist + booking embed; tests cover checklist generation for all case types.

### Phase 5: Staff dashboard
- Scope: intake list with status/case type; intake detail view with AI-generated summary; checklist item tracking (received/missing toggles); reminder queue — auto-created reminders for missing docs, simulated send with visible log.
- Done when: staff can open any seeded/demo intake, read its AI summary, toggle checklist items, and trigger a simulated reminder whose log entry appears; auth blocks logged-out access.

### Phase 6: Polish + demo hardening
- Scope: landing page framing the project as a demo (feature tour incl. UPL guardrail callout); iframe embed snippet; seeded demo intakes; error/empty/loading states; deploy to Vercel.
- Done when: live Vercel URL runs the full flow start-to-finish without console errors; landing page explains the demo; a stranger can complete an intake unaided.

## Risks / open decisions
- Embedding model (OpenAI text-embedding-3-small vs Voyage) — decide in Phase 2, log it.
- Widget embed = iframe snippet for demo; true npm widget is out of scope.
- Keep intake scripted-with-flex; fully open-ended chat is less reliable in live demos.
