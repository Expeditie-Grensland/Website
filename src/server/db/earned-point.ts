import db from "./schema/database.js";

export const getFullEarnedPoints = () =>
  db
    .selectFrom("earned_point")
    .leftJoin("expeditie", "expeditie_id", "expeditie.id")
    .leftJoin("person", "person_id", "person.id")
    .selectAll("earned_point")
    .select([
      "expeditie.name as expeditie_name",
      "person.first_name as person_first_name",
      "person.last_name as person_last_name",
      "person.team as team",
    ])
    .orderBy("time_stamp desc")
    .execute();
