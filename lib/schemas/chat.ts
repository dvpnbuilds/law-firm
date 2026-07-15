import { z } from "zod";

export const faqRequestSchema = z.object({
  question: z.string().min(1),
  caseTypeId: z.string().uuid().nullable().optional(),
});
export type FaqRequest = z.infer<typeof faqRequestSchema>;

export const faqResponseSchema = z.object({
  answer: z.string().min(1),
  refused: z.boolean(),
  citations: z.array(z.string()),
});
export type FaqResponse = z.infer<typeof faqResponseSchema>;
