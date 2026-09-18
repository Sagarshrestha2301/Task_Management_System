import { z } from "zod";

export const uploadAttachmentSchema = z.object({
  file: z.any(), // handled by multer
});
