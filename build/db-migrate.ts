import fs from "node:fs/promises";
import type { MigrationResultSet } from "kysely";
import { getDb } from "../src/server/db/schema/database";
import { getMigrator } from "../src/server/db/schema/migrator";
import { getArgvOption } from "./common/options";

const choice = getArgvOption("create", "list", "latest", "up", "down");

const createMigration = async () => {
  const rawName = process.argv[3];
  if (!rawName)
    throw new Error("Name required as second command-line argument");

  const name =
    new Date()
      .toISOString()
      .slice(0, 19)
      .replaceAll("-", "")
      .replaceAll(":", "")
      .replace("T", "-") +
    "-" +
    rawName.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");

  await fs.writeFile(
    `src/server/db/schema/migrations/${name}.ts`,
    `import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
};

export const down = async (db: Kysely<any>) => {
};
`
  );

  console.info(`Created migration: ${name}`);
};

const printResults = async (resultSet: Promise<MigrationResultSet>) => {
  const { results, error } = await resultSet;

  if (results?.length) {
    console.info("Applied migrations:");
    console.table(results, ["migrationName", "status", "direction"]);
  } else {
    console.info("No migrations were applied");
  }

  if (error) throw error;
};

switch (choice) {
  case "create":
    await createMigration();
    break;

  case "list":
    console.table(await getMigrator().getMigrations(), ["name", "executedAt"]);
    break;

  case "latest":
    await printResults(getMigrator().migrateToLatest());
    break;

  case "up":
    await printResults(getMigrator().migrateUp());
    break;

  case "down":
    await printResults(getMigrator().migrateDown());
    break;
}

await getDb().destroy();
