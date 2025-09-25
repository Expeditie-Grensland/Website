import { type Kysely, sql } from "kysely";

const tableRenames = [
  { oldName: "geo_node", newName: "geo_segment" },
  { oldName: "geo_node_edge", newName: "geo_segment_link" },
  { oldName: "geo_node_person", newName: "geo_segment_person" },
];

const columnRenames = [
  { table: "geo_segment_person", oldName: "node_id", newName: "segment_id" },
  { table: "geo_location", oldName: "node_id", newName: "segment_id" },
  { table: "story", oldName: "node_id", newName: "segment_id" },
];

const indexRenames = [
  {
    table: "geo_segment",
    oldName: "geo_node_pkey",
    newName: "geo_segment_pkey",
  },
  {
    table: "geo_segment",
    oldName: "geo_node_expeditie_id_fkey",
    newName: "geo_segment_expeditie_id_fkey",
  },
  {
    table: "geo_segment_link",
    oldName: "geo_node_edge_pkey",
    newName: "geo_segment_link_pkey",
  },
  {
    table: "geo_segment_link",
    oldName: "geo_node_edge_child_id_fkey",
    newName: "geo_segment_link_child_id_fkey",
  },
  {
    table: "geo_segment_link",
    oldName: "geo_node_edge_parent_id_fkey",
    newName: "geo_segment_link_parent_id_fkey",
  },
  {
    table: "geo_segment_person",
    oldName: "geo_node_person_pkey",
    newName: "geo_segment_person_pkey",
  },
  {
    table: "geo_segment_person",
    oldName: "geo_node_person_geo_node_id_fkey",
    newName: "geo_segment_person_segment_id_fkey",
  },
  {
    table: "geo_segment_person",
    oldName: "geo_node_person_person_id_fkey",
    newName: "geo_segment_person_person_id_fkey",
  },
  {
    table: "geo_location",
    oldName: "geo_location_node_id_fkey",
    newName: "geo_location_segment_id_fkey",
  },
  {
    table: "geo_location",
    oldName: "geo_location_node_id_time_stamp_key",
    newName: "geo_location_segment_id_time_stamp_key",
  },
  {
    table: "story",
    oldName: "story_node_id_fkey",
    newName: "story_segment_id_fkey",
  },
  {
    table: "story",
    oldName: "story_node_id_time_stamp_key",
    newName: "story_segment_id_time_stamp_key",
  },
];

const sequenceRenames = [
  { oldName: "geo_node_id_seq", newName: "geo_segment_id_seq" },
];

export const up = async (db: Kysely<any>) => {
  for (const { oldName, newName } of tableRenames) {
    await db.schema.alterTable(oldName).renameTo(newName).execute();
  }

  for (const { table, oldName, newName } of columnRenames) {
    await db.schema.alterTable(table).renameColumn(oldName, newName).execute();
  }

  for (const { table, oldName, newName } of indexRenames) {
    await sql`ALTER TABLE ${sql.ref(table)} RENAME CONSTRAINT ${sql.ref(oldName)} TO ${sql.ref(newName)}`.execute(
      db
    );
  }

  for (const { oldName, newName } of sequenceRenames) {
    await sql`ALTER SEQUENCE ${sql.ref(oldName)} RENAME TO ${sql.ref(newName)}`.execute(
      db
    );
  }
};

export const down = async (db: Kysely<any>) => {
  for (const { oldName, newName } of sequenceRenames) {
    await sql`ALTER SEQUENCE ${sql.ref(newName)} RENAME TO ${sql.ref(oldName)}`.execute(
      db
    );
  }

  for (const { table, oldName, newName } of indexRenames) {
    await sql`ALTER TABLE ${sql.ref(table)} RENAME CONSTRAINT ${sql.ref(newName)} TO ${sql.ref(oldName)}`.execute(
      db
    );
  }

  for (const { table, oldName, newName } of columnRenames) {
    await db.schema.alterTable(table).renameColumn(newName, oldName).execute();
  }

  for (const { oldName, newName } of tableRenames) {
    await db.schema.alterTable(newName).renameTo(oldName).execute();
  }
};
