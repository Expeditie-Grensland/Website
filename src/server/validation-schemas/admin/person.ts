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

  email: z.string().optional(),

  addresses: z
    .object({
      id: z.array(
        z
          .literal("")
          .transform(() => undefined)
          .or(z.coerce.number().int())
      ),
      name: z.array(z.string().optional()),
      line_1: z.array(z.string()),
      line_2: z.array(z.string()),
      country: z.array(z.string()),
    })
    .default({
      id: [],
      name: [],
      line_1: [],
      line_2: [],
      country: [],
    })
    .refine(
      (obj) =>
        obj.id.length == obj.name.length &&
        obj.id.length == obj.line_1.length &&
        obj.id.length == obj.line_2.length &&
        obj.id.length == obj.country.length
    )
    .transform((obj) =>
      obj.id.map((id, idx) => ({
        id,
        name: obj.name[idx],
        line_1: obj.line_1[idx],
        line_2: obj.line_2[idx],
        country: obj.country[idx],
      }))
    ),
});
