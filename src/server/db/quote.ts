import type { Insertable, Updateable } from "kysely";
import { getDb } from "./schema/database.js";
import type { Quote } from "./schema/types.js";

export const getAllQuotes = () =>
  getDb()
    .selectFrom("quote")
    .selectAll()
    .orderBy("time_stamp", "asc")
    .execute();

export const addQuote = (quote: Insertable<Quote>) =>
  getDb()
    .insertInto("quote")
    .values(quote)
    .returningAll()
    .executeTakeFirstOrThrow();

export const updateQuote = (id: string, quote: Updateable<Quote>) =>
  getDb()
    .updateTable("quote")
    .set(quote)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deleteQuote = (id: string) =>
  getDb()
    .deleteFrom("quote")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
