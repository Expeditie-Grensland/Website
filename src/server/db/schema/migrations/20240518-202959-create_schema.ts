/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createTable("expeditie")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("subtitle", "text", (col) => col.notNull())
    .addColumn("sequence_number", "integer", (col) => col.notNull())
    .addColumn("finished", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("show_map", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("countries", sql`text[]`, (col) =>
      col.notNull().defaultTo(sql`'{}'`)
    )
    .addColumn("background_file", "text")
    .addColumn("movie_file", "text")
    .addColumn("movie_restricted", "boolean", (col) =>
      col.notNull().defaultTo(false)
    )
    .execute();

  await db.schema
    .createIndex("expeditie_sequence_number_idx")
    .on("expeditie")
    .column("sequence_number")
    .execute();

  await db.schema.createType("person_team").asEnum(["r", "b"]).execute();
  await db.schema
    .createType("person_type")
    .asEnum(["admin", "member", "guest"])
    .execute();

  await db.schema
    .createTable("person")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("first_name", "text", (col) => col.notNull())
    .addColumn("last_name", "text", (col) => col.notNull())
    .addColumn("sorting_name", "text", (col) => col.notNull())
    .addColumn("initials", "text", (col) => col.notNull())
    .addColumn("ldap_id", "text")
    .addColumn("type", sql`person_type`, (col) => col.notNull())
    .addColumn("team", sql`person_team`)
    .execute();

  await db.schema
    .createTable("expeditie_person")
    .addColumn("expeditie_id", "text", (col) =>
      col.references("expeditie.id").onUpdate("cascade").onDelete("cascade")
    )
    .addColumn("person_id", "text", (col) =>
      col.references("person.id").onUpdate("cascade").onDelete("cascade")
    )
    .addPrimaryKeyConstraint("expeditie_person_pkey", [
      "expeditie_id",
      "person_id",
    ])
    .execute();

  await db.schema
    .createTable("expeditie_movie_editor")
    .addColumn("expeditie_id", "text", (col) =>
      col.references("expeditie.id").onUpdate("cascade").onDelete("cascade")
    )
    .addColumn("person_id", "text", (col) =>
      col.references("person.id").onUpdate("cascade").onDelete("cascade")
    )
    .addPrimaryKeyConstraint("expeditie_movie_editor_pkey", [
      "expeditie_id",
      "person_id",
    ])
    .execute();

  await db.schema
    .createTable("word")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("word", "text", (col) => col.notNull())
    .addColumn("phonetic", "text")
    .addColumn("definitions", sql`text[]`, (col) =>
      col.notNull().defaultTo(sql`'{}'`)
    )
    .addColumn("attachment_file", "text")
    .execute();

  await db.schema
    .createIndex("word_word_idx")
    .on("word")
    .column("word")
    .execute();

  await db.schema
    .createTable("quote")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("quote", "text", (col) => col.notNull())
    .addColumn("quotee", "text", (col) => col.notNull())
    .addColumn("context", "text", (col) => col.notNull())
    .addColumn("time_stamp", "integer", (col) => col.notNull())
    .addColumn("time_zone", "text", (col) => col.notNull())
    .addColumn("attachment_file", "text")
    .execute();

  await db.schema
    .createIndex("quote_time_idx")
    .on("quote")
    .column("time_stamp")
    .execute();

  await db.schema
    .createTable("afko")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("afko", "text", (col) => col.notNull())
    .addColumn("definitions", sql`text[]`, (col) =>
      col.notNull().defaultTo(sql`'{}'`)
    )
    .addColumn("attachment_file", "text")
    .execute();

  await db.schema
    .createIndex("afko_afko_idx")
    .on("afko")
    .column("afko")
    .execute();

  await db.schema
    .createTable("earned_point")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("expeditie_id", "text", (col) =>
      col.references("expeditie.id").onUpdate("cascade").onDelete("set null")
    )
    .addColumn("person_id", "text", (col) =>
      col
        .notNull()
        .references("person.id")
        .onUpdate("cascade")
        .onDelete("cascade")
    )
    .addColumn("amount", "int2", (col) => col.notNull())
    .addColumn("time_stamp", "integer", (col) => col.notNull())
    .addColumn("time_zone", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("earned_point_time_idx")
    .on("earned_point")
    .column("time_stamp")
    .execute();

  await db.schema
    .createTable("geo_node")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("expeditie_id", "text", (col) =>
      col
        .notNull()
        .references("expeditie.id")
        .onUpdate("cascade")
        .onDelete("cascade")
    )
    .addColumn("time_from", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("time_till", "integer", (col) =>
      col.notNull().defaultTo(2147483647)
    )
    .execute();

  await db.schema
    .createTable("geo_node_person")
    .addColumn("geo_node_id", "integer", (col) =>
      col
        .notNull()
        .references("geo_node.id")
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
    .addPrimaryKeyConstraint("geo_node_person_pkey", ["geo_node_id", "person_id"])
    .execute();

  await db.schema
    .createTable("geo_location")
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
    .addColumn("latitude", "float8", (col) => col.notNull())
    .addColumn("longitude", "float8", (col) => col.notNull())
    .addColumn("altitude", "float4")
    .execute();

  await db.schema
    .createIndex("geo_location_expeditie_id")
    .on("geo_location")
    .column("expeditie_id")
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable("expeditie").cascade().execute();
  await db.schema.dropTable("person").cascade().execute();
  await db.schema.dropTable("expeditie_person").execute();
  await db.schema.dropTable("expeditie_movie_editor").execute();
  await db.schema.dropTable("word").execute();
  await db.schema.dropTable("quote").execute();
  await db.schema.dropTable("afko").execute();
  await db.schema.dropTable("earned_point").execute();
  await db.schema.dropTable("geo_node").cascade().execute();
  await db.schema.dropTable("geo_node_person").execute();
  await db.schema.dropTable("geo_location").execute();

  await db.schema.dropType("person_team").execute();
  await db.schema.dropType("person_type").execute();
};
