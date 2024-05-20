import { sql } from "kysely";
import db from "./schema/database.js";

export const getAllExpedities = () =>
  db
    .selectFrom("expeditie")
    .selectAll()
    .orderBy("sequence_number desc")
    .execute();

export const getExpeditie = (id: string) =>
  db
    .selectFrom("expeditie")
    .where("id", "=", id)
    .selectAll()
    .limit(1)
    .executeTakeFirst();

export const getFullExpeditie = async (id: string) => {
  const peopleProm = db
    .selectFrom("expeditie_person")
    .where("expeditie_id", "=", id)
    .rightJoin("person", "person_id", "id")
    .orderBy([sql`CASE WHEN type='guest' then 1 ELSE 0 END`, "sorting_name asc"])
    .selectAll("person")
    .execute();

  const movieEditorsProm = db
    .selectFrom("expeditie_movie_editor")
    .where("expeditie_id", "=", id)
    .rightJoin("person", "person_id", "id")
    .orderBy("sorting_name asc")
    .selectAll("person")
    .execute();

  const expeditie = await getExpeditie(id);

  return (
    expeditie && {
      ...expeditie,
      people: await peopleProm,
      movie_editors: await movieEditorsProm,
    }
  );
};
