import { z } from "zod";
export const validationErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string()).optional(),
    requestId: z.string(),
  }),
});
