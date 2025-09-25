import type { Insertable, Updateable } from "kysely";
import { getDb } from "./schema/database.js";
import type { Word } from "./schema/types.js";

export const getAllWords = () =>
  getDb().selectFrom("word").selectAll().orderBy("word", "asc").execute();

export const addWord = (word: Insertable<Word>) =>
  getDb()
    .insertInto("word")
    .values(word)
    .returningAll()
    .executeTakeFirstOrThrow();

export const updateWord = (id: string, word: Updateable<Word>) =>
  getDb()
    .updateTable("word")
    .set(word)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deleteWord = (id: string) =>
  getDb()
    .deleteFrom("word")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
