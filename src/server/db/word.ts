import { Insertable, Updateable } from "kysely";
import db from "./schema/database.js";
import { Word } from "./schema/types.js";

export const getAllWords = () =>
  db.selectFrom("word").selectAll().orderBy("word asc").execute();

export const addWord = (word: Insertable<Word>) =>
  db.insertInto("word").values(word).returningAll().executeTakeFirstOrThrow();

export const updateWord = (id: number, word: Updateable<Word>) =>
  db
    .updateTable("word")
    .set(word)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deleteWord = (id: number) =>
  db
    .deleteFrom("word")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
