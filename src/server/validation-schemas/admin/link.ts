import { z } from "zod";

export const linkSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  url: z.url().nonempty(),
  index: z.coerce.number().int(),
});
