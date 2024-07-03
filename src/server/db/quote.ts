import { Insertable, Updateable } from "kysely";
import db from "./schema/database.js";
import { Quote } from "./schema/types.js";

export const getAllQuotes = () =>
  db.selectFrom("quote").selectAll().orderBy("time_stamp asc").execute();

export const addQuote = (quote: Insertable<Quote>) =>
  db.insertInto("quote").values(quote).returningAll().executeTakeFirstOrThrow();

export const updateQuote = (id: string, quote: Updateable<Quote>) =>
  db
    .updateTable("quote")
    .set(quote)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deleteQuote = (id: string) =>
  db
    .deleteFrom("quote")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
