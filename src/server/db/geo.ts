import { randomUUID } from "crypto";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { asyncMapInChunks } from "../helpers/chunk.js";
import { parseGpx } from "../helpers/gpx.js";
import { getDb } from "./schema/database.js";

export const getRouteVersion = (expeditieId: string) =>
  getDb()
    .selectFrom("geo_location")
    .leftJoin("geo_node", "geo_location.node_id", "geo_node.id")
    .select(({ fn }) => [
      fn.count("geo_location.id").as("count"),
      fn.max("geo_location.id").as("max"),
    ])
    .where("geo_node.expeditie_id", "=", expeditieId)
    .executeTakeFirst()
    .then((val) => (val ? `v2c${val.count}m${val.max}` : "v2none"));

export const getExpeditieNodes = (expeditieId: string) =>
  getDb()
    .selectFrom("geo_node")
    .leftJoin("geo_node_edge", "geo_node.id", "geo_node_edge.parent_id")
    .selectAll("geo_node")
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("geo_node_person")
          .leftJoin("person", "geo_node_person.person_id", "person.id")
          .selectAll("person")
          .whereRef("geo_node_person.node_id", "=", "geo_node.id")
      ).as("persons"),
    ])
    .select(({ fn, val }) =>
      fn<number[]>("array_remove", [
        fn.agg("array_agg", ["geo_node_edge.child_id"]),
        val(null),
      ]).as("child_ids")
    )
    .where("expeditie_id", "=", expeditieId)
    .groupBy("geo_node.id")
    .orderBy("geo_node.id")
    .execute();

export const getNodeLocations = (
  node: Awaited<ReturnType<typeof getExpeditieNodes>>[number]
) =>
  getDb()
    .selectFrom("geo_location")
    .select(["id", "latitude", "longitude"])
    .where("node_id", "=", node.id)
    .orderBy("time_stamp asc")
    .execute();

export const getAllNodes = () =>
  getDb()
    .selectFrom("geo_node")
    .innerJoin("expeditie", "geo_node.expeditie_id", "expeditie.id")
    .leftJoin("geo_node_edge", "geo_node.id", "geo_node_edge.parent_id")
    .selectAll("geo_node")
    .select("expeditie.name as expeditie_name")
    .select(({ fn, val }) =>
      fn<number[]>("array_remove", [
        fn.agg("array_agg", ["geo_node_edge.child_id"]),
        val(null),
      ]).as("child_ids")
    )
    .groupBy("expeditie.id")
    .groupBy("geo_node.id")
    .orderBy("expeditie.start_date")
    .orderBy("geo_node.id")
    .execute();

// FIXME: Get closest location instead
export const getFirstNodeLocationAfter = (
  node: Awaited<ReturnType<typeof getExpeditieNodes>>[number],
  afterStamp: number
) =>
  getDb()
    .selectFrom("geo_location")
    .select(["id", "latitude", "longitude"])
    .where("node_id", "=", node.id)
    .where("time_stamp", ">=", afterStamp)
    .orderBy("time_stamp asc")
    .limit(1)
    .executeTakeFirst();

export const insertLocationsFromGpx = async (
  location: { node_id: number; time_zone: string },
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
