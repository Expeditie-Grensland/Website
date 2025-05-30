import { Insertable, Updateable } from "kysely";
import { getDb } from "./schema/database.js";
import { Afko } from "./schema/types.js";

export const getAllAfkos = () =>
  getDb().selectFrom("afko").selectAll().orderBy("afko", "asc").execute();

export const addAfko = (afko: Insertable<Afko>) =>
  getDb()
    .insertInto("afko")
    .values(afko)
    .returningAll()
    .executeTakeFirstOrThrow();

export const updateAfko = (id: string, afko: Updateable<Afko>) =>
  getDb()
    .updateTable("afko")
    .set(afko)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deleteAfko = (id: string) =>
  getDb()
    .deleteFrom("afko")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
