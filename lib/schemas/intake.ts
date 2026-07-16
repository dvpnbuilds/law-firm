import { z } from "zod";

export const intakeCaseTypeSlugSchema = z.enum(["personal_injury", "family_law", "immigration", "other"]);

export const intakeStatusSchema = z.enum(["in_progress", "completed", "handoff"]);

export const intakeStepSchema = z.enum(["description", "name", "email", "phone", "done"]);

export const intakeDetailsSchema = z.object({
  step: intakeStepSchema,
  description: z.string().optional(),
});
export type IntakeDetails = z.infer<typeof intakeDetailsSchema>;

export const intakeMessageRequestSchema = z.object({
  intakeId: z.string().uuid().nullable(),
  message: z.string().min(1),
});
export type IntakeMessageRequest = z.infer<typeof intakeMessageRequestSchema>;

export const checklistItemOutSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  received: z.boolean(),
});
export type ChecklistItemOut = z.infer<typeof checklistItemOutSchema>;

export const intakeMessageResponseSchema = z.object({
  intakeId: z.string().uuid(),
  reply: z.string().min(1),
  status: intakeStatusSchema,
  mode: z.enum(["intake", "faq"]),
  complete: z.boolean(),
  summary: z.string().optional(),
  checklist: z.array(checklistItemOutSchema).optional(),
});
export type IntakeMessageResponse = z.infer<typeof intakeMessageResponseSchema>;

export const classificationSchema = z.object({
  caseType: intakeCaseTypeSlugSchema,
});
export type Classification = z.infer<typeof classificationSchema>;
