import { parseGpx } from "../helpers/gpx.js";
import db from "./schema/database.js";

export const getNewestLocation = (expeditieId: string) =>
  db
    .selectFrom("geo_location")
    .where("expeditie_id", "=", expeditieId)
    .orderBy("id desc")
    .select("id")
    .limit(1)
    .executeTakeFirst()
    .then((result) => result?.id || -1);

export const getLocationCount = (expeditieId: string) =>
  db
    .selectFrom("geo_location")
    .where("expeditie_id", "=", expeditieId)
    .select(({ fn }) => [fn.countAll<bigint>().as("count")])
    .executeTakeFirst()
    .then((result) => result?.count || 0n);

export const getNodesWithPersonIds = (expeditieId: string) =>
  db
    .selectFrom("geo_node")
    .where("expeditie_id", "=", expeditieId)
    .innerJoin("geo_node_person", "id", "geo_node_id")
    .groupBy("geo_node.id")
    .selectAll("geo_node")
    .select(({ fn }) => [
      fn<string[]>("array_agg", ["person_id"]).as("person_ids"),
    ])
    .execute();

export const getNodeLocations = (
  node: Awaited<ReturnType<typeof getNodesWithPersonIds>>[number]
) =>
  db
    .selectFrom("geo_location")
    .select(["id", "latitude", "longitude"])
    .where("expeditie_id", "=", node.expeditie_id)
    .where("person_id", "in", node.person_ids)
    .where("time_stamp", ">=", node.time_from)
    .where("time_stamp", "<", node.time_till)
    .orderBy("time_stamp asc")
    .execute();

export const insertLocationsFromGpx = (
  gpxData: Buffer | string,
  expeditieId: string,
  personId: string,
  timezone = "Europe/Amsterdam"
) =>
  db
    .insertInto("geo_location")
    .values(
      parseGpx(gpxData).map(({ time, __lat, __lon, ele }) => ({
        expeditie_id: expeditieId,
        person_id: personId,
        time_stamp: Math.round(Date.parse(time) / 1000),
        time_zone: timezone,
        latitude: __lat,
        longitude: __lon,
        altitude: ele,
      }))
    )
    .executeTakeFirst()
    .then((result) => result.numInsertedOrUpdatedRows || 0n);
