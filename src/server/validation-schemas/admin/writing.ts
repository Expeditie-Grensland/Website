import { z } from "zod";
import { idSchema } from "./common.js";

export const writingSchema = z.object({
  id: idSchema,
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  text: z.string().nonempty(),
  index: z.coerce.number().int(),
});
