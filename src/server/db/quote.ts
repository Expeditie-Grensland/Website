import db from "./schema/database.js";

export const getAllQuotes = () =>
  db.selectFrom("quote").selectAll().orderBy("time_stamp asc").execute();

export const getQuoteById = (id: number) =>
  db
    .selectFrom("quote")
    .where("id", "=", id)
    .selectAll()
    .limit(1)
    .executeTakeFirst();
