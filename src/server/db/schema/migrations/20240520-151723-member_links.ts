/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from "kysely";
import { config } from "../../../helpers/configHelper.js";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createTable("member_link")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("url", "text", (col) => col.notNull())
    .addColumn("index", "integer", (col) => col.notNull())
    .execute();

  if (!config.EG_MONGO_URL) return;

  // @ts-expect-error No MongoDB included
  const { MongoClient } = await import("mongodb");
  const mongo = new MongoClient(config.EG_MONGO_URL);
  await mongo.connect();
  const mdb = mongo.db();

  const links = mdb.collection("memberlinks").find();

  for await (const link of links) {
    await db
      .insertInto("member_link")
      .values({
        title: link.title,
        description: link.text,
        url: link.href,
        index: link.index || 0,
      })
      .execute();
  }

  await mongo.close();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable("member_link").execute();
};
