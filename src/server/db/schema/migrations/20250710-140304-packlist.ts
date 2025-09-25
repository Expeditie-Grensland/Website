import type { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createTable("packlist")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("position", "integer", (col) => col.notNull())
    .addColumn("default", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createIndex("packlist_position_idx")
    .on("packlist")
    .column("position")
    .execute();

  await db.schema
    .createTable("packlist_item")
    .addColumn("id", "serial")
    .addColumn("packlist_id", "text", (col) =>
      col
        .notNull()
        .references("packlist.id")
        .onUpdate("cascade")
        .onDelete("restrict")
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("position", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("packlist_item_packlist_id_position_idx")
    .on("packlist_item")
    .columns(["packlist_id", "position"])
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.dropIndex("packlist_item_packlist_id_position_idx").execute();
  await db.schema.dropTable("packlist_item").execute();
  await db.schema.dropIndex("packlist_position_idx").execute();
  await db.schema.dropTable("packlist").cascade().execute();
};
