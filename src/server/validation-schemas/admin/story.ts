import { z } from "zod";
import {
  expeditieIdCheckSchema,
  localTimeTransformer,
  timeZoneSchema,
} from "./common.js";

export const storySchema = z
  .object({
    segment_id: z.coerce.number().int(),
    time_local: z.string(),
    time_zone: timeZoneSchema,
    title: z.string(),
    text: z.string().optional(),
    media_ids: z
      .array(
        z
          .literal("")
          .transform(() => undefined)
          .or(z.coerce.number().int())
      )
      .default([]),
    media_files: z.array(z.string()).default([]),
    media_descriptions: z.array(z.string()).default([]),
  })
  .refine(
    ({ media_ids, media_files, media_descriptions }) =>
      media_ids.length === media_files.length &&
      media_files.length === media_descriptions.length,
    {
      message: "Media aantallen zijn niet gelijk",
      path: ["media_files"],
    }
  )
  .transform(localTimeTransformer)
  .transform(({ media_ids, media_files, media_descriptions, ...rest }) => ({
    ...rest,
    media: media_files.map((file, i) => ({
      id: media_ids[i],
      file,
      description: media_descriptions[i],
    })),
  }));

export const storyPrefixParamsSchema = z.object({
  expeditie: expeditieIdCheckSchema,
});
