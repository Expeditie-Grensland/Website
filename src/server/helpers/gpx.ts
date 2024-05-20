import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

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

export const parseGpx = (gpxData: Buffer | string) =>
  gpxSchema
    .parse(
      new XMLParser({
        ignoreDeclaration: true,
        ignoreAttributes: false,
        attributeNamePrefix: "__",
        trimValues: true,
        parseAttributeValue: true,
        parseTagValue: true,
        isArray: (_name, jpath) =>
          ["gpx.trk", "gpx.trk.trkseg", "gpx.trk.trkseg.trkpt"].includes(jpath),
      }).parse(gpxData)
    )
    .gpx.trk.flatMap((trk) => trk.trkseg)
    .flatMap((seg) => seg.trkpt);
