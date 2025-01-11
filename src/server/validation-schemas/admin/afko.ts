import { z } from "zod";
import { idSchema } from "./common.js";

export const afkoSchema = z.object({
  id: idSchema,
  afko: z.string(),
  definitions: z.array(z.string().nonempty()).nonempty(),
  attachment_file: z.string().optional(),
});
