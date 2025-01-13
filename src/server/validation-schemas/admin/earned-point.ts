import { z } from "zod";
import { localTimeTransformer, timeZoneSchema } from "./common.js";

export const pointSchema = z
  .object({
    person_id: z.string(),
    expeditie_id: z.string().transform((x) => (x == "-" ? null : x)),
    team: z.enum(["red", "blue"]),
    amount: z.coerce.number().int(),
    time_local: z.string(),
    time_zone: timeZoneSchema,
  })
  .transform(localTimeTransformer);
