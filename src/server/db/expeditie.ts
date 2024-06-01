import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import db from "./schema/database.js";

export const getAllExpedities = ({ noDrafts = false } = {}) =>
  db
    .selectFrom("expeditie")
    .selectAll()
    .orderBy("sequence_number desc")
    .$if(noDrafts, (qb) => qb.where("draft", "=", false))
    .execute();

export const getFullExpeditie = (id: string) =>
  db
    .selectFrom("expeditie")
    .where("id", "=", id)
    .selectAll("expeditie")
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("expeditie_person")
          .innerJoin("person", "expeditie_person.person_id", "person.id")
          .selectAll("person")
          .whereRef("expeditie_person.expeditie_id", "=", "expeditie.id")
          .orderBy(sql`CASE WHEN type='guest' then 1 ELSE 0 END, sorting_name`)
      ).as("persons"),
      jsonArrayFrom(
        eb
          .selectFrom("expeditie_movie_editor")
          .innerJoin("person", "expeditie_movie_editor.person_id", "person.id")
          .selectAll("person")
          .whereRef("expeditie_movie_editor.expeditie_id", "=", "expeditie.id")
          .orderBy("sorting_name")
      ).as("movie_editors"),
    ])
    .limit(1)
    .executeTakeFirst();
