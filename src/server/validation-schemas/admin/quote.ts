import { z } from "zod";
import { idSchema, localTimeTransformer, timeZoneSchema } from "./common.js";

export const quoteSchema = z
  .object({
    id: idSchema,
    quote: z.string(),
    quotee: z.string(),
    context: z.string(),
    attachment_file: z.string().optional(),
    time_local: z.string(),
    time_zone: timeZoneSchema,
  })
  .transform(localTimeTransformer);
