/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("geo_location")
    .addColumn("batch", "uuid")
    .execute();

  await db
    .updateTable("geo_location")
    .set({ batch: "00000000-0000-0000-0000-000000000000" })
    .execute();

  await db.schema
    .alterTable("geo_location")
    .alterColumn("batch", (col) => col.setNotNull())
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.alterTable("geo_location").dropColumn("batch").execute();
};
