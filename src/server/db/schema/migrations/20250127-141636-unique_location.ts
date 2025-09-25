import type { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
  for (const table of ["geo_location", "story"]) {
    await db
      .deleteFrom(`${table} as a`)
      .using(`${table} as b`)
      .whereRef("a.id", ">", "b.id")
      .whereRef("a.node_id", "=", "b.node_id")
      .whereRef("a.time_stamp", "=", "b.time_stamp")
      .execute();

    await db.schema
      .alterTable(table)
      .addUniqueConstraint(`${table}_node_id_time_stamp_key`, [
        "node_id",
        "time_stamp",
      ])
      .execute();
  }

  await db.schema.dropIndex("geo_location_node_id_time_stamp_idx").execute();
};

export const down = async (db: Kysely<any>) => {
  for (const table of ["geo_location", "story"]) {
    await db.schema
      .alterTable(table)
      .dropConstraint(`${table}_node_id_time_stamp_key`)
      .execute();
  }

  await db.schema
    .createIndex("geo_location_node_id_time_stamp_idx")
    .on("geo_location")
    .columns(["node_id", "time_stamp"])
    .execute();
};
