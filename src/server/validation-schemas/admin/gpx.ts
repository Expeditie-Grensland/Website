import { z } from "zod";
import { timeZoneSchema } from "./common.js";

export const gpxSchema = z.object({
  node_id: z.coerce.number().int(),
  time_zone: timeZoneSchema,
  file: z.array(z.instanceof(Buffer)),
});
