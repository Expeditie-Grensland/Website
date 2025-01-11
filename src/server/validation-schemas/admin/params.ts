import { z } from "zod";
import { idSchema } from "./common.js";

export const idParamsSchema = z.object({
  id: idSchema,
});

export const keyParamsSchema = z.object({
  key: z.string().min(1),
});

export const numIdParamsSchema = z.object({
  id: z.coerce.number(),
});
