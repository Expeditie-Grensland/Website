import { Insertable, Updateable } from "kysely";
import { getDb } from "./schema/database.js";
import { MemberWriting } from "./schema/types.js";

export const getMemberWritingsList = () =>
  getDb()
    .selectFrom("member_writing")
    .selectAll()
    .orderBy("index asc")
    .execute();

export const getFullMemberWriting = (id: string) =>
  getDb()
    .selectFrom("member_writing")
    .where("id", "=", id)
    .select(["title", "text"])
    .executeTakeFirst();

export const addMemberWriting = (memberWriting: Insertable<MemberWriting>) =>
  getDb()
    .insertInto("member_writing")
    .values(memberWriting)
    .returningAll()
    .executeTakeFirstOrThrow();

export const updateMemberWriting = (
  id: string,
  memberWriting: Updateable<MemberWriting>
) =>
  getDb()
    .updateTable("member_writing")
    .set(memberWriting)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deleteMemberWriting = (id: string) =>
  getDb()
    .deleteFrom("member_writing")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
