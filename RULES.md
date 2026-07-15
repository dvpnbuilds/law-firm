# Rules
1. One phase at a time. Never start phase N+1 until phase N is audited-pass.
2. Update PROGRESS.md at the end of every session.
3. No new dependencies without noting them in the decision log.
4. Keep PLAN.md immutable after approval; scope changes go through DV and get logged.
5. Write tests for each phase's completion criteria before marking it built.
6. UPL guardrail: no code path may return legal advice. Every chat endpoint passes through the refusal layer in lib/ai/guardrail.ts. Never bypass it, even for tests.
7. All LLM structured outputs are validated with Zod; on validation failure, retry once then fall back to human-handoff — never persist unvalidated LLM output.
8. All DB access through lib/db/ repositories; no inline Supabase queries elsewhere.
9. Use claude-haiku for all classify/chat calls; do not upgrade models without logging cost rationale.
10. No real client data, real firm names, or real email/SMS sending anywhere in this repo.
11. Secrets only via .env.local / Vercel env vars; never committed, never read into logs.
12. Every intake-affecting change must keep the seed + demo flow working (`npm run seed` then full widget walkthrough).
