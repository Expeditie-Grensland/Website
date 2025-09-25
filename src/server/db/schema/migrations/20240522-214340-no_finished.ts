import type { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema.alterTable("expeditie").dropColumn("finished").execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("expeditie")
    .addColumn("finished", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();
};
