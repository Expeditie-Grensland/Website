import { Insertable } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { asyncMapInChunks } from "../helpers/chunk.js";
import { getDb } from "./schema/database.js";
import { GeoLocation } from "./schema/types.js";

export const getRouteVersion = (expeditieId: string) =>
  getDb()
    .selectFrom("geo_location")
    .leftJoin("geo_segment", "geo_location.segment_id", "geo_segment.id")
    .select(({ fn }) => [
      fn.count("geo_location.id").as("count"),
      fn.max("geo_location.id").as("max"),
    ])
    .where("geo_segment.expeditie_id", "=", expeditieId)
    .executeTakeFirst()
    .then((val) => (val ? `v3c${val.count}m${val.max}` : "v2none"));

export const getExpeditieSegments = (expeditieId: string) =>
  getDb()
    .selectFrom("geo_segment")
    .leftJoin(
      "geo_segment_link",
      "geo_segment.id",
      "geo_segment_link.parent_id"
    )
    .selectAll("geo_segment")
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("geo_segment_person")
          .leftJoin("person", "geo_segment_person.person_id", "person.id")
          .selectAll("person")
          .whereRef("geo_segment_person.segment_id", "=", "geo_segment.id")
          .orderBy("person.sorting_name")
      ).as("persons"),
    ])
    .select(({ fn, val }) =>
      fn<number[]>("array_remove", [
        fn.agg("array_agg", ["geo_segment_link.child_id"]),
        val(null),
      ]).as("child_ids")
    )
    .where("expeditie_id", "=", expeditieId)
    .groupBy("geo_segment.id")
    .orderBy("geo_segment.id")
    .execute();

export const getSegmentLocations = (
  segment: Awaited<ReturnType<typeof getExpeditieSegments>>[number]
) =>
  getDb()
    .selectFrom("geo_location")
    .select(["id", "latitude", "longitude"])
    .where("segment_id", "=", segment.id)
    .orderBy("time_stamp asc")
    .execute();

export const addLocations = async (locations: Insertable<GeoLocation>[]) =>
  (
    await asyncMapInChunks(locations, 1000, (locs) =>
      getDb()
        .insertInto("geo_location")
        .values(locs)
        .onConflict((oc) =>
          oc.columns(["segment_id", "time_stamp"]).doNothing()
        )
        .executeTakeFirst()
    )
  ).reduce(
    (count, result) => count + (result.numInsertedOrUpdatedRows || 0n),
    0n
  );
