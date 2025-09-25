import type { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createTable("person_address")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("person_id", "text", (col) =>
      col
        .notNull()
        .references("person.id")
        .onUpdate("cascade")
        .onDelete("cascade")
    )
    .addColumn("name", "text")
    .addColumn("line_1", "text", (col) => col.notNull())
    .addColumn("line_2", "text", (col) => col.notNull())
    .addColumn("country", "text", (col) => col.notNull())
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable("person_address").execute();
};
