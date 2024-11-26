/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createTable("story")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("expeditie_id", "text", (col) =>
      col
        .notNull()
        .references("expeditie.id")
        .onUpdate("cascade")
        .onDelete("cascade")
    )
    .addColumn("person_id", "text", (col) =>
      col
        .notNull()
        .references("person.id")
        .onUpdate("cascade")
        .onDelete("cascade")
    )
    .addColumn("time_stamp", "integer", (col) => col.notNull())
    .addColumn("time_zone", "text", (col) => col.notNull())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("text", "text")
    .execute();

  await db.schema
    .createTable("story_media")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("story_id", "integer", (col) =>
      col
        .notNull()
        .references("story.id")
        .onUpdate("cascade")
        .onDelete("cascade")
    )
    .addColumn("file", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull().defaultTo(""))
    .execute();

  if (!process.env.EG_MONGO_URL) return;

  // @ts-expect-error No MongoDB included
  const { MongoClient } = await import("mongodb");
  const mongo = new MongoClient(process.env.EG_MONGO_URL);
  await mongo.connect();
  const mdb = mongo.db();

  const expeditieIds = new Map<string, string>();
  const personIds = new Map<string, string>();

  for await (const expeditie of mdb.collection("expedities").find()) {
    expeditieIds.set(expeditie._id.toHexString(), expeditie.nameShort);
  }

  for await (const person of mdb.collection("people").find()) {
    personIds.set(person._id.toHexString(), person.userName);
  }

  for await (const story of mdb.collection("storyelements").find()) {
    const insertResult = await db
      .insertInto("story")
      .values({
        expeditie_id: expeditieIds.get(story.expeditieId.toHexString()),
        person_id: personIds.get(story.personId.toHexString()),
        time_stamp: story.dateTime.stamp,
        time_zone: story.dateTime.zone,
        title: story.title || story.name || undefined,
        text: story.text || undefined,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    if (story.media)
      await db
        .insertInto("story_media")
        .values(
          story.media.map((medium: any) => ({
            story_id: insertResult.id,
            file: medium.file,
            description: medium.description,
          }))
        )
        .execute();
  }

  await mongo.close();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable("story").cascade().execute();
  await db.schema.dropTable("story_media").execute();
};
