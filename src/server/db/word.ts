import db from "./schema/database.js";

export const getAllWords = () =>
  db.selectFrom("word").selectAll().orderBy("word asc").execute();

export const getWordById = (id: number) =>
  db
    .selectFrom("word")
    .where("id", "=", id)
    .selectAll()
    .limit(1)
    .executeTakeFirst();
