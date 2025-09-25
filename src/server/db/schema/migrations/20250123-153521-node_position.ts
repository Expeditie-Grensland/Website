import type { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("geo_node")
    .addColumn("position_part", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("position_total", "integer", (col) => col.notNull().defaultTo(1))
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("geo_node")
    .dropColumn("position_part")
    .dropColumn("position_total")
    .execute();
};
