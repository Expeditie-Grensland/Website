import { z } from "zod";
import { checkboxSchema, dateSchema, idSchema } from "./common.js";

export const expeditieSchema = z.object({
  id: idSchema,
  name: z.string(),
  subtitle: z.string(),
  draft: checkboxSchema,
  start_date: dateSchema,
  end_date: dateSchema,
  persons: z.array(z.string()).nonempty(),
  show_map: checkboxSchema,
  countries: z.array(z.string()).nonempty(),
  background_file: z.string().optional(),
  movie_file: z.string().optional(),
  movie_restricted: checkboxSchema,
  movie_editors: z.array(z.string()).default([]),
});
