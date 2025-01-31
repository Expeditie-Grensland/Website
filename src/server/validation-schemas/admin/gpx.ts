import { z } from "zod";
import { checkboxSchema, timeZoneSchema } from "./common.js";

const gpxWayPointSchema = z.object({
  time: z.string().datetime(),
  name: z.string(),
  desc: z.string().optional(),
});

const gpxTrackPointSchema = z.object({
  time: z.string().datetime(),
  _lat: z.number(),
  _lon: z.number(),
  ele: z.number().optional(),
});

export const gpxXmlFileSchema = z.object({
  gpx: z.object({
    wpt: z.array(gpxWayPointSchema).default([]),

    trk: z.array(
      z.object({
        trkseg: z.array(
          z.object({
            trkpt: z.array(gpxTrackPointSchema),
          })
        ),
      })
    ),
  }),
});

export const gpxSchema = z.object({
  segment_id: z.coerce.number().int(),
  time_zone: timeZoneSchema,
  enable_locations: checkboxSchema,
  enable_stories: checkboxSchema,
  file: z.preprocess(
    (f) => (Array.isArray(f) ? f : [f]),
    z.array(z.instanceof(Buffer))
  ),
});
