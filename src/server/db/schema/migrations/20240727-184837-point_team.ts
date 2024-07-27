/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("earned_point")
    .addColumn("team", sql`person_team`)
    .execute();

  await db
    .updateTable("earned_point")
    .set({ team: sql`person.team` })
    .from("person")
    .whereRef("earned_point.person_id", "=", "person.id")
    .execute();

  await db.schema
    .alterTable("earned_point")
    .alterColumn("team", (col) => col.setNotNull())
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.alterTable("earned_point").dropColumn("team").execute();
};
