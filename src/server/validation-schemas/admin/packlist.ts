import z from "zod";
import { checkboxSchema, idSchema } from "./common.js";
import { getPacklist } from "../../db/packlist.js";

export const packlistSchema = z.object({
  id: idSchema,
  name: z.string().nonempty(),
  default: checkboxSchema,
  position: z.coerce.number().int(),
});

export const packlistItemSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().optional(),
  position: z.coerce.number().int(),
});

export const packlistIdCheckSchema = z
  .string()
  .transform(getPacklist)
  .refine((exp) => exp != undefined);

export const packlistPrefixParamsSchema = z.object({
  packlist: packlistIdCheckSchema,
});
