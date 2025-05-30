import { Insertable, Updateable } from "kysely";
import { getDb } from "./schema/database.js";
import { MemberLink } from "./schema/types.js";

export const getMemberLinks = () =>
  getDb()
    .selectFrom("member_link")
    .selectAll()
    .orderBy("index", "asc")
    .execute();

export const addMemberLink = (memberLink: Insertable<MemberLink>) =>
  getDb()
    .insertInto("member_link")
    .values(memberLink)
    .returningAll()
    .executeTakeFirstOrThrow();

export const updateMemberLink = (
  id: number,
  memberLink: Updateable<MemberLink>
) =>
  getDb()
    .updateTable("member_link")
    .set(memberLink)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deleteMemberLink = (id: number) =>
  getDb()
    .deleteFrom("member_link")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
