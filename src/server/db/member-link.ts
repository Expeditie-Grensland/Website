import { getDb } from "./schema/database.js";

export const getMemberLinks = () =>
  getDb().selectFrom("member_link").selectAll().orderBy("index asc").execute();
