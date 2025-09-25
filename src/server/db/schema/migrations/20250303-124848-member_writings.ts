import type { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createTable("member_writing")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("text", "text", (col) => col.notNull())
    .addColumn("index", "integer", (col) => col.notNull())
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable("member_writing").execute();
};
