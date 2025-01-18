import { randomUUID } from "crypto";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { asyncMapInChunks } from "../helpers/chunk.js";
import { parseGpx } from "../helpers/gpx.js";
import { getDb } from "./schema/database.js";

export const getNewestLocation = (expeditieId: string) =>
  getDb()
    .selectFrom("geo_location")
    .where("expeditie_id", "=", expeditieId)
    .orderBy("id desc")
    .select("id")
    .limit(1)
    .executeTakeFirst()
    .then((result) => result?.id || -1);

export const getLocationCount = (expeditieId: string) =>
  getDb()
    .selectFrom("geo_location")
    .where("expeditie_id", "=", expeditieId)
    .select(({ fn }) => [fn.countAll<bigint>().as("count")])
    .executeTakeFirst()
    .then((result) => result?.count || 0n);

export const getLocationsVersionString = async (expeditieId: string) => {
  const [locationCount, lastLocation] = await Promise.all([
    getLocationCount(expeditieId),
    getNewestLocation(expeditieId),
  ]);

  return `v1-${locationCount}-${lastLocation}`;
};

export const getNodesWithPersons = (expeditieId: string) =>
  getDb()
    .selectFrom("geo_node")
    .where("expeditie_id", "=", expeditieId)
    .selectAll("geo_node")
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("geo_node_person")
          .leftJoin("person", "geo_node_person.person_id", "person.id")
          .selectAll("person")
          .whereRef("geo_node_person.geo_node_id", "=", "geo_node.id")
      ).as("persons"),
    ])
    .execute();

export const getNodeLocations = (
  node: Awaited<ReturnType<typeof getNodesWithPersons>>[number]
) =>
  getDb()
    .selectFrom("geo_location")
    .select(["id", "latitude", "longitude"])
    .where("expeditie_id", "=", node.expeditie_id)
    .where(
      "person_id",
      "in",
      node.persons.map((p) => p.id)
    )
    .where("time_stamp", ">=", node.time_from)
    .where("time_stamp", "<", node.time_till)
    .orderBy("time_stamp asc")
    .execute();

export const getFirstNodeLocationAfter = (
  node: Awaited<ReturnType<typeof getNodesWithPersons>>[number],
  afterStamp: number
) =>
  getDb()
    .selectFrom("geo_location")
    .select(["id", "latitude", "longitude"])
    .where("expeditie_id", "=", node.expeditie_id)
    .where(
      "person_id",
      "in",
      node.persons.map((p) => p.id)
    )
    .where("time_stamp", ">=", node.time_from)
    .where("time_stamp", "<", node.time_till)
    .where("time_stamp", ">=", afterStamp)
    .orderBy("time_stamp asc")
    .limit(1)
    .executeTakeFirst();

export const insertLocationsFromGpx = async (
  location: { expeditie_id: string; person_id: string; time_zone: string },
  gpxData: Buffer | string
) => {
  const batch = randomUUID();

  const gpsLocations = parseGpx(gpxData).map(({ time, __lat, __lon, ele }) => ({
    ...location,
    time_stamp: Math.round(Date.parse(time) / 1000),
    latitude: __lat,
    longitude: __lon,
    altitude: ele,
    batch,
  }));

  const insertedCounts = await asyncMapInChunks(gpsLocations, 1000, (locs) =>
    getDb()
      .insertInto("geo_location")
      .values(locs)
      .executeTakeFirst()
      .then((result) => result.numInsertedOrUpdatedRows || 0n)
  );

  return insertedCounts.reduce((acc, val) => acc + val);
};
