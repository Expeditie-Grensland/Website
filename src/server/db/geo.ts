import { Insertable } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { asyncMapInChunks } from "../helpers/chunk.js";
import { allValues, EnumTextMap } from "./enums.js";
import { getDb } from "./schema/database.js";
import { GeoLocation, GeoSegment, GeoSegmentType } from "./schema/types.js";

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

type WithChildAndPersonIds = { child_ids: number[]; person_ids: string[] };

export const addSegment = ({
  child_ids,
  person_ids,
  ...segment
}: Insertable<GeoSegment> & WithChildAndPersonIds) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      const result = await trx
        .insertInto("geo_segment")
        .values(segment)
        .returningAll()
        .executeTakeFirstOrThrow();

      if (child_ids.length > 0) {
        await trx
          .insertInto("geo_segment_link")
          .values(
            child_ids.map((id) => ({ parent_id: result.id, child_id: id }))
          )
          .execute();
      }

      if (person_ids.length > 0) {
        await trx
          .insertInto("geo_segment_person")
          .values(
            person_ids.map((id) => ({ segment_id: result.id, person_id: id }))
          )
          .execute();
      }

      return result;
    });

export const updateSegment = (
  id: number,
  {
    child_ids,
    person_ids,
    ...segment
  }: Insertable<GeoSegment> & WithChildAndPersonIds
) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      const result = await trx
        .updateTable("geo_segment")
        .set(segment)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();

      await trx
        .deleteFrom("geo_segment_link")
        .where("parent_id", "=", result.id)
        .$if(child_ids.length > 0, (qb) =>
          qb.where("child_id", "not in", child_ids)
        )
        .execute();

      if (child_ids.length > 0) {
        await trx
          .insertInto("geo_segment_link")
          .values(
            child_ids.map((id) => ({ parent_id: result.id, child_id: id }))
          )
          .onConflict((oc) => oc.doNothing())
          .execute();
      }

      await trx
        .deleteFrom("geo_segment_person")
        .where("segment_id", "=", result.id)
        .$if(person_ids.length > 0, (qb) =>
          qb.where("person_id", "not in", person_ids)
        )
        .execute();

      if (person_ids.length > 0) {
        await trx
          .insertInto("geo_segment_person")
          .values(
            person_ids.map((id) => ({ segment_id: result.id, person_id: id }))
          )
          .onConflict((oc) => oc.doNothing())
          .execute();
      }

      return result;
    });

export const deleteSegment = (id: number) =>
  getDb()
    .deleteFrom("geo_segment")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const geoSegmentTypeNames = {
  normal: "Normaal",
  flight: "Vlucht",

  [allValues]: ["normal", "flight"],
} as const satisfies EnumTextMap<GeoSegmentType>;
