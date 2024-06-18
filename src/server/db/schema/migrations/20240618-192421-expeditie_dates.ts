/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("expeditie")
    .addColumn("start_date", "date")
    .addColumn("end_date", "date")
    .execute();

  await db
    .updateTable("expeditie")
    .set({
      start_date: sql`to_timestamp(sequence_number * 86400)::date`,
      end_date: sql`to_timestamp(sequence_number * 86400)::date`,
    })
    .execute();

  await db.schema
    .alterTable("expeditie")
    .alterColumn("start_date", (col) => col.setNotNull())
    .alterColumn("end_date", (col) => col.setNotNull())
    .dropColumn("sequence_number")
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("expeditie")
    .addColumn("sequence_number", "integer")
    .execute();

  await db
    .updateTable("expeditie")
    .set({
      sequence_number: sql`(extract(epoch from start_date) / 86400)`,
    })
    .execute();

  await db.schema
    .alterTable("expeditie")
    .alterColumn("sequence_number", (col) => col.setNotNull())
    .dropColumn("start_date")
    .dropColumn("end_date")
    .execute();
};
