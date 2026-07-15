---
name: seed-content
description: Generate or regenerate the fictional firm knowledge base and demo data. Trigger: "seed content", "regenerate firm content", "add demo intakes".
---
1. Firm is fictional: "Hartwell & Vance LLP" (rename only if DV asks). Practice areas: personal injury, family law, immigration.
2. Generate per practice area: 8-12 FAQs (fees, timelines, process, what to bring), a process-overview page, and a document checklist template. Plus firm-wide pages: about, consultation policy, fee structure.
3. Content must be process/firm info only — NEVER legal advice (no "you should sue", no outcome predictions). This content feeds the RAG store, so UPL compliance starts here.
4. Write to the seed script's content source (Phase 1 defines location, e.g. seed/content/*.md); run `npm run seed`; verify kb_chunks row count > 0.
5. For demo intakes: create 4-6 varied intakes (each practice area + one "other"/handoff) with realistic-but-fictional names.
