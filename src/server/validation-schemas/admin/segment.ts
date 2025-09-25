import { z } from "zod";
import { allValues } from "../../db/enums.js";
import { geoSegmentTypeTexts } from "../../db/geo.js";
import { expeditieIdCheckSchema } from "./common.js";

export const segmentSchema = z
  .object({
    description: z.string().nonempty(),
    type: z.enum(geoSegmentTypeTexts[allValues]),
    color: z
      .string()
      .regex(/^#[0-9a-z]{6}$/, "Kleur moet geldig formaat hebben"),
    position_part: z.coerce.number().int(),
    position_total: z.coerce.number().int(),
    person_ids: z.array(z.string().nonempty()).default([]),
    child_ids: z.array(z.coerce.number().int()).default([]),
  })
  .refine(
    ({ position_part, position_total }) => position_total >= position_part,
    {
      message: "Deel van positie moet kleiner zijn dan totaal",
      path: ["position_part"],
    }
  );

export const segmentPrefixParamsSchema = z.object({
  expeditie: expeditieIdCheckSchema,
});
