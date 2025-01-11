import { z } from "zod";
import { timeZoneSchema } from "./common.js";

export const gpxSchema = z.object({
  person_id: z.string(),
  expeditie_id: z.string(),
  time_zone: timeZoneSchema,
  file: z.array(z.instanceof(Buffer)),
});
