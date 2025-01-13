import { z } from "zod";
import { idSchema } from "./common.js";

export const personSchema = z.object({
  id: idSchema,
  first_name: z.string(),
  last_name: z.string(),
  sorting_name: z.string(),
  initials: z.string(),
  type: z.enum(["admin", "member", "guest", "former"]),
  team: z
    .enum(["blue", "red", "green", "-"])
    .transform((value) => (value == "-" ? null : value)),
  email: z.string().email().optional(),
});
