import type { CaseTypeSeed, ChecklistTemplateItemSeed, KbChunkSeed } from "@/lib/schemas/seed";

// Fictional firm: "Alden & Cross Legal". No real firm, no real client data.

export const caseTypes: CaseTypeSeed[] = [
  {
    slug: "personal_injury",
    name: "Personal Injury",
    description:
      "Car accidents, slip-and-fall, and other injury claims where negligence caused harm.",
  },
  {
    slug: "family_law",
    name: "Family Law",
    description: "Divorce, custody, child support, and other family matters.",
  },
  {
    slug: "immigration",
    name: "Immigration",
    description: "Visas, green cards, naturalization, and related immigration matters.",
  },
];

export const checklistTemplates: ChecklistTemplateItemSeed[] = [
  { caseTypeSlug: "personal_injury", label: "Police or incident report", sortOrder: 0 },
  { caseTypeSlug: "personal_injury", label: "Medical records and bills", sortOrder: 1 },
  { caseTypeSlug: "personal_injury", label: "Photos of injuries and scene", sortOrder: 2 },
  { caseTypeSlug: "personal_injury", label: "Insurance correspondence", sortOrder: 3 },
  { caseTypeSlug: "personal_injury", label: "Lost wage documentation", sortOrder: 4 },

  { caseTypeSlug: "family_law", label: "Marriage certificate", sortOrder: 0 },
  { caseTypeSlug: "family_law", label: "Financial statements (income, assets, debts)", sortOrder: 1 },
  { caseTypeSlug: "family_law", label: "Children's birth certificates", sortOrder: 2 },
  { caseTypeSlug: "family_law", label: "Existing custody or support orders", sortOrder: 3 },

  { caseTypeSlug: "immigration", label: "Valid passport", sortOrder: 0 },
  { caseTypeSlug: "immigration", label: "Current visa or status documents", sortOrder: 1 },
  { caseTypeSlug: "immigration", label: "Prior immigration filings (I-130, I-485, etc.)", sortOrder: 2 },
  { caseTypeSlug: "immigration", label: "Proof of relationship (if family-based)", sortOrder: 3 },
  { caseTypeSlug: "immigration", label: "Employment verification (if employment-based)", sortOrder: 4 },
];

export const kbChunks: KbChunkSeed[] = [
  {
    caseTypeSlug: "personal_injury",
    sourceTitle: "Personal Injury — Process Overview",
    content:
      "After an initial consultation, Alden & Cross gathers evidence (medical records, police reports, witness statements), sends a demand letter to the at-fault party's insurer, and negotiates a settlement. If no fair settlement is reached, the firm may file a lawsuit. Most personal injury cases settle before trial.",
  },
  {
    caseTypeSlug: "personal_injury",
    sourceTitle: "Personal Injury — Fees",
    content:
      "Personal injury cases at Alden & Cross are handled on a contingency fee basis: no upfront cost, and the firm is paid a percentage of any settlement or award only if the case succeeds.",
  },
  {
    caseTypeSlug: "personal_injury",
    sourceTitle: "Personal Injury — Timeline",
    content:
      "Straightforward claims may resolve in 3-6 months. Cases requiring litigation can take 1-2 years depending on court schedules and the complexity of injuries.",
  },
  {
    caseTypeSlug: "family_law",
    sourceTitle: "Family Law — Process Overview",
    content:
      "Family law matters typically begin with a consultation to understand goals, followed by filing the relevant petition (divorce, custody, support). Alden & Cross represents clients in mediation and, when needed, in court hearings.",
  },
  {
    caseTypeSlug: "family_law",
    sourceTitle: "Family Law — Fees",
    content:
      "Family law matters are billed hourly, with a retainer collected at the start of representation. The firm provides an estimated fee range during the initial consultation based on case complexity.",
  },
  {
    caseTypeSlug: "family_law",
    sourceTitle: "Family Law — Mediation",
    content:
      "Many custody and divorce matters are resolved through mediation before reaching a courtroom, which is typically faster and less costly than litigation.",
  },
  {
    caseTypeSlug: "immigration",
    sourceTitle: "Immigration — Process Overview",
    content:
      "Immigration cases start with an eligibility review, followed by preparing and filing the appropriate petition with USCIS. Alden & Cross tracks case status and prepares clients for any required interviews.",
  },
  {
    caseTypeSlug: "immigration",
    sourceTitle: "Immigration — Fees",
    content:
      "Immigration matters are billed as a flat fee per filing type, quoted after the eligibility review. Government filing fees are separate and paid directly to USCIS.",
  },
  {
    caseTypeSlug: "immigration",
    sourceTitle: "Immigration — Timeline",
    content:
      "Processing times vary widely by visa or petition type and current USCIS backlogs, ranging from a few months to over a year.",
  },
  {
    sourceTitle: "Firm — General Consultation Policy",
    content:
      "Alden & Cross offers a free initial consultation for all new matters. Consultations can be scheduled directly through the chat assistant's booking step.",
  },
  {
    sourceTitle: "Firm — Office Hours",
    content:
      "Alden & Cross is open Monday through Friday, 9am to 6pm. The chat assistant is available anytime for intake and FAQs, with staff following up during office hours.",
  },
];
