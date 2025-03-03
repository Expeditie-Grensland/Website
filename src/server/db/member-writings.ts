import { getDb } from "./schema/database.js";

export const getMemberWritingsList = () =>
  getDb()
    .selectFrom("member_writing")
    .select(["id", "title", "description"])
    .orderBy("index asc")
    .execute();

export const getFullMemberWriting = (id: string) =>
  getDb()
    .selectFrom("member_writing")
    .where("id", "=", id)
    .select(["title", "text"])
    .executeTakeFirst();
