import { Insertable, sql, Updateable } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { getDb } from "./schema/database.js";
import { Expeditie } from "./schema/types.js";

export const getAllExpedities = ({ noDrafts = false } = {}) =>
  getDb()
    .selectFrom("expeditie")
    .selectAll()
    .orderBy("start_date desc")
    .orderBy("end_date desc")
    .$if(noDrafts, (qb) => qb.where("draft", "=", false))
    .execute();

export const getAllExpeditiesWithPeopleIds = () =>
  getDb()
    .selectFrom("expeditie")
    .selectAll()
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("expeditie_person")
          .innerJoin("person", "expeditie_person.person_id", "person.id")
          .select("person.id")
          .whereRef("expeditie_person.expeditie_id", "=", "expeditie.id")
          .orderBy("person.id")
      ).as("persons"),
      jsonArrayFrom(
        eb
          .selectFrom("expeditie_movie_editor")
          .innerJoin("person", "expeditie_movie_editor.person_id", "person.id")
          .select("person.id")
          .whereRef("expeditie_movie_editor.expeditie_id", "=", "expeditie.id")
          .orderBy("person.id")
      ).as("movie_editors"),
    ])
    .orderBy("start_date desc")
    .orderBy("end_date desc")
    .execute()
    .then((expedities) =>
      expedities.map(({ persons, movie_editors, ...rest }) => ({
        ...rest,
        persons: persons.map(({ id }) => id),
        movie_editors: movie_editors.map(({ id }) => id),
      }))
    );

export const getFullExpeditie = (id: string) =>
  getDb()
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

type ExpeditieExternals = {
  persons: [string, ...string[]];
  movie_editors: string[];
};

export const addExpeditie = ({
  persons,
  movie_editors,
  ...expeditie
}: Insertable<Expeditie> & ExpeditieExternals) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      const result = await trx
        .insertInto("expeditie")
        .values(expeditie)
        .returningAll()
        .executeTakeFirstOrThrow();

      await trx
        .insertInto("expeditie_person")
        .values(
          persons.map((person_id) => ({
            person_id,
            expeditie_id: expeditie.id,
          }))
        )
        .execute();

      if (movie_editors.length > 0) {
        await trx
          .insertInto("expeditie_movie_editor")
          .values(
            movie_editors.map((person_id) => ({
              person_id,
              expeditie_id: expeditie.id,
            }))
          )
          .execute();
      }

      return result;
    });

export const updateExpeditie = (
  id: string,
  {
    persons,
    movie_editors,
    ...expeditie
  }: Updateable<Expeditie> & ExpeditieExternals
) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await trx
        .deleteFrom("expeditie_person")
        .where("expeditie_id", "=", id)
        .where("person_id", "not in", persons)
        .execute();

      await trx
        .insertInto("expeditie_person")
        .values(
          persons.map((person_id) => ({
            person_id,
            expeditie_id: id,
          }))
        )
        .onConflict((oc) => oc.doNothing())
        .execute();

      await trx
        .deleteFrom("expeditie_movie_editor")
        .where("expeditie_id", "=", id)
        .$if(movie_editors.length > 0, (qb) =>
          qb.where("person_id", "not in", movie_editors)
        )
        .execute();

      if (movie_editors.length > 0) {
        await trx
          .insertInto("expeditie_movie_editor")
          .values(
            movie_editors.map((person_id) => ({
              person_id,
              expeditie_id: id,
            }))
          )
          .onConflict((oc) => oc.doNothing())
          .execute();
      }

      return await trx
        .updateTable("expeditie")
        .set(expeditie)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();
    });

export const deleteExpeditie = (id: string) =>
  getDb()
    .deleteFrom("expeditie")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
