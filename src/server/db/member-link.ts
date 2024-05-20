import db from "./schema/database.js";

export const getMemberLinks = () =>
  db.selectFrom("member_link").selectAll().orderBy("index asc").execute();
