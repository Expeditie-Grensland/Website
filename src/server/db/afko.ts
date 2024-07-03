import { Insertable, Updateable } from "kysely";
import db from "./schema/database.js";
import { Afko } from "./schema/types.js";

export const getAllAfkos = () =>
  db.selectFrom("afko").selectAll().orderBy("afko asc").execute();

export const addAfko = (afko: Insertable<Afko>) =>
  db.insertInto("afko").values(afko).returningAll().executeTakeFirstOrThrow();

export const updateAfko = (id: string, afko: Updateable<Afko>) =>
  db
    .updateTable("afko")
    .set(afko)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deleteAfko = (id: string) =>
  db
    .deleteFrom("afko")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
