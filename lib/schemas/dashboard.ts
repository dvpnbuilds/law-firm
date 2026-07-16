import { z } from "zod";

export const toggleChecklistItemRequestSchema = z.object({
  received: z.boolean(),
});
export type ToggleChecklistItemRequest = z.infer<typeof toggleChecklistItemRequestSchema>;
