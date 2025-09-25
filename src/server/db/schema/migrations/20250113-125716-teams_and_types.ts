import { type Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
  await sql`ALTER TYPE "person_team" RENAME TO "_person_team"`.execute(db);

  await db.schema
    .createType("person_team")
    .asEnum(["blue", "red", "green"])
    .execute();

  for (const table of ["person", "earned_point"]) {
    await db.schema
      .alterTable(table)
      .alterColumn("team", (col) =>
        col.setDataType(
          sql`"person_team" USING (CASE WHEN "team"='r' THEN 'red' WHEN "team"='b' THEN 'blue' END)::"person_team"`
        )
      )
      .execute();
  }

  await db.schema.dropType("_person_team").execute();

  await sql`ALTER TYPE "person_type" ADD VALUE 'former'`.execute(db);
};

export const down = async (db: Kysely<any>) => {
  await sql`ALTER TYPE "person_team" RENAME TO "_person_team"`.execute(db);

  await db.schema.createType("person_team").asEnum(["b", "r"]).execute();

  for (const table of ["person", "earned_point"]) {
    await db.schema
      .alterTable(table)
      .alterColumn("team", (col) =>
        col.setDataType(
          sql`"person_team" USING (CASE WHEN "team"='red' THEN 'r' WHEN "team"='blue' THEN 'b' END)::"person_team"`
        )
      )
      .execute();
  }

  await db.schema.dropType("_person_team").execute();

  await sql`ALTER TYPE "person_type" RENAME TO "_person_type"`.execute(db);

  await db.schema
    .createType("person_type")
    .asEnum(["admin", "member", "guest"])
    .execute();

  await db.schema
    .alterTable("person")
    .alterColumn("type", (col) =>
      col.setDataType(
        sql`"person_type" USING (CASE WHEN "type"='former' THEN 'member' ELSE "type" END)::TEXT::"person_type"`
      )
    )
    .execute();

  await db.schema.dropType("_person_type").execute();
};
