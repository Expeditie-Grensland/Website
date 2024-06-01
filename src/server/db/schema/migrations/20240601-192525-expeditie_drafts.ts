/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("expeditie")
    .addColumn("draft", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .alterTable("expeditie")
    .addCheckConstraint(
      "expeditie_draft_background_check",
      sql`draft OR background_file IS NOT NULL`
    )
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.alterTable("expeditie").dropColumn("draft").execute();
};
