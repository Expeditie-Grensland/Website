import { sql } from "kysely";
import db from "./schema/database.js";
import { jsonAggTable } from "./schema/utils.js";

export const getAllExpedities = () =>
  db
    .selectFrom("expeditie")
    .selectAll()
    .orderBy("sequence_number desc")
    .execute();

export const getFullExpeditie = (id: string) =>
  db
    .selectFrom("expeditie")
    .leftJoin(
      (eb) =>
        eb
          .selectFrom("expeditie_person")
          .innerJoin("person", "expeditie_person.person_id", "person.id")
          .where("expeditie_id", "=", id)
          .select([
            "expeditie_id",
            jsonAggTable("person", "person.id", {
              orderBy: sql`CASE WHEN type='guest' then 1 ELSE 0 END, sorting_name`,
            }).as("persons"),
          ])
          .groupBy("expeditie_id")
          .as("_1"),
      (join) => join.onTrue()
    )
    .leftJoin(
      (eb) =>
        eb
          .selectFrom("expeditie_movie_editor")
          .innerJoin("person", "expeditie_movie_editor.person_id", "person.id")
          .where("expeditie_id", "=", id)
          .select([
            "expeditie_id",
            jsonAggTable("person", "person.id", {
              orderBy: sql`sorting_name`,
            }).as("movie_editors"),
          ])
          .groupBy("expeditie_id")
          .as("_2"),
      (join) => join.onTrue()
    )
    .where("id", "=", id)
    .selectAll("expeditie")
    .select(["_1.persons", "_2.movie_editors"])
    .limit(1)
    .executeTakeFirst();
