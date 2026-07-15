import { z } from "zod";

export const caseTypeSlugSchema = z.enum(["personal_injury", "family_law", "immigration"]);

export const caseTypeSeedSchema = z.object({
  slug: caseTypeSlugSchema,
  name: z.string().min(1),
  description: z.string().min(1),
});
export type CaseTypeSeed = z.infer<typeof caseTypeSeedSchema>;

export const checklistTemplateItemSeedSchema = z.object({
  caseTypeSlug: caseTypeSlugSchema,
  label: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
});
export type ChecklistTemplateItemSeed = z.infer<typeof checklistTemplateItemSeedSchema>;

export const kbChunkSeedSchema = z.object({
  caseTypeSlug: caseTypeSlugSchema.optional(),
  sourceTitle: z.string().min(1),
  content: z.string().min(1),
});
export type KbChunkSeed = z.infer<typeof kbChunkSeedSchema>;
