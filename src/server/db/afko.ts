import db from "./schema/database.js";

export const getAllAfkos = () =>
  db.selectFrom("afko").selectAll().orderBy("afko asc").execute();

export const getAfkoById = (id: number) =>
  db
    .selectFrom("afko")
    .where("id", "=", id)
    .selectAll()
    .limit(1)
    .executeTakeFirst();
