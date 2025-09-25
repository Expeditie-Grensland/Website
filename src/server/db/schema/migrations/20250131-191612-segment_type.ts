import { type Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createType("geo_segment_type")
    .asEnum(["normal", "flight"])
    .execute();

  await db.schema
    .alterTable("geo_segment")
    .addColumn("type", sql`geo_segment_type`, (col) =>
      col.notNull().defaultTo("normal")
    )
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.alterTable("geo_segment").dropColumn("type").execute();
  await db.schema.dropType("geo_segment_type").execute();
};
