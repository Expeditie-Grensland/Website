import { randomUUID } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import type { Insertable } from "kysely";
import type { GeoLocation, Story } from "../db/schema/types.js";
import { gpxXmlFileSchema } from "../validation-schemas/admin/gpx.js";

type ParsedGPX = {
  locations: Insertable<GeoLocation>[];
  stories: Insertable<Story>[];
};

export const parseGpx = (
  rawData: Buffer | string,
  segmentId: number,
  timeZone: string
): ParsedGPX => {
  const parsedXml = new XMLParser({
    ignoreDeclaration: true,
    ignoreAttributes: false,
    attributeNamePrefix: "_",
    trimValues: true,
    parseAttributeValue: true,
    parseTagValue: true,
    isArray: (_name, jpath) =>
      jpath === "gpx.trk" ||
      jpath === "gpx.trk.trkseg" ||
      jpath === "gpx.trk.trkseg.trkpt" ||
      jpath === "gpx.wpt",
  }).parse(rawData);

  const { gpx } = gpxXmlFileSchema.parse(parsedXml);
  const batch = randomUUID();

  return {
    locations: gpx.trk
      .flatMap(({ trkseg }) => trkseg)
      .flatMap(({ trkpt }) => trkpt)
      .map(({ time, _lat, _lon, ele }) => ({
        batch,
        segment_id: segmentId,
        time_stamp: Math.round(Date.parse(time) / 1000),
        time_zone: timeZone,
        latitude: _lat,
        longitude: _lon,
        altitude: ele,
      })),

    stories: gpx.wpt
      .filter(({ name }) => !name.startsWith("Stop for ~"))
      .map(({ time, name, desc }) => ({
        segment_id: segmentId,
        time_stamp: Math.round(Date.parse(time) / 1000),
        time_zone: timeZone,
        title: name,
        text: desc,
      })),
  };
};
