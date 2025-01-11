import { z } from "zod";
import { idSchema } from "./common.js";

export const wordSchema = z.object({
  id: idSchema,
  word: z.string(),
  definitions: z.array(z.string()).nonempty(),
  phonetic: z.string().optional(),
  attachment_file: z.string().optional(),
});
