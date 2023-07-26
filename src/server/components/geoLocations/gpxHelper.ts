import { XMLParser } from "fast-xml-parser";
import { z } from "zod";
import { DateTimeInternal } from "../dateTime/model.js";
import { GeoLocation } from "./model.js";
import mongoose from "mongoose";

const gpxSchema = z.object({
  gpx: z.object({
    trk: z.array(
      z.object({
        trkseg: z.array(
          z.object({
            trkpt: z.array(
              z.object({
                time: z.string().datetime(),
                __lat: z.number(),
                __lon: z.number(),
                ele: z.number().optional(),
              })
            ),
          })
        ),
      })
    ),
  }),
});

export const generateLocations = async (
  gpx: Buffer | string,
  expeditieId: mongoose.Types.ObjectId,
  personId: mongoose.Types.ObjectId,
  timezone = "Europe/Amsterdam"
): Promise<GeoLocation[]> => {
  const data = gpxSchema.parse(
    new XMLParser({
      ignoreDeclaration: true,
      ignoreAttributes: false,
      attributeNamePrefix: "__",
      trimValues: true,
      parseAttributeValue: true,
      parseTagValue: true,
      isArray: (name, jpath) =>
        ["gpx.trk", "gpx.trk.trkseg", "gpx.trk.trkseg.trkpt"].includes(jpath),
    }).parse(gpx)
  );

  return data.gpx.trk
    .flatMap((trk) => trk.trkseg)
    .flatMap((seg) => seg.trkpt)
    .map((point) => ({
      expeditieId,
      personId,
      dateTime: {
        stamp: Math.round(Date.parse(point.time) / 1000),
        zone: timezone,
      } as DateTimeInternal,
      latitude: point.__lat,
      longitude: point.__lon,
      altitude: point.ele,
    }));
};
