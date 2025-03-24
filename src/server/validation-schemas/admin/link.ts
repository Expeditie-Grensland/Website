import { z } from "zod";

export const linkSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  url: z.string().nonempty().url(),
  index: z.coerce.number().int(),
});
