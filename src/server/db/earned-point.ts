import { Insertable, Updateable } from "kysely";
import db from "./schema/database.js";
import { EarnedPoint } from "./schema/types.js";

export const getAllEarnedPoints = () =>
  db
    .selectFrom("earned_point")
    .selectAll()
    .orderBy("time_stamp desc")
    .execute();

export const getFullEarnedPoints = () =>
  db
    .selectFrom("earned_point")
    .leftJoin("expeditie", "expeditie_id", "expeditie.id")
    .leftJoin("person", "person_id", "person.id")
    .selectAll("earned_point")
    .select([
      "expeditie.name as expeditie_name",
      "person.first_name as person_first_name",
      "person.last_name as person_last_name",
      "person.team as team",
    ])
    .orderBy("time_stamp desc")
    .execute();

export const addEarnedPoint = (earnedPoint: Insertable<EarnedPoint>) =>
  db
    .insertInto("earned_point")
    .values(earnedPoint)
    .returningAll()
    .executeTakeFirstOrThrow();

export const updateEarnedPoint = (
  id: number,
  earnedPoint: Updateable<EarnedPoint>
) =>
  db
    .updateTable("earned_point")
    .set(earnedPoint)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deleteEarnedPoint = (id: number) =>
  db
    .deleteFrom("earned_point")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
