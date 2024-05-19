import "dotenv/config";

import { MigrationResultSet } from "kysely";
import fs from "node:fs/promises";
import db from "../src/server/db/schema/database";
import migrator from "../src/server/db/schema/migrator";

const opts = ["create", "list", "latest", "up", "down"] as const;
const choice = process.argv[2] as (typeof opts)[number];

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
    `/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from "kysely";

export const up = async (db: Kysely<unknown>) => {
};

export const down = async (db: Kysely<unknown>) => {
};
`
  );

  console.info(`Created migration: ${name}`);
};

const printResults = async (resultSet: Promise<MigrationResultSet>) => {
  const { results, error } = await resultSet;

  if (results && results.length) {
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
    console.table(await migrator.getMigrations(), ["name", "executedAt"]);
    break;

  case "latest":
    await printResults(migrator.migrateToLatest());
    break;

  case "up":
    await printResults(migrator.migrateUp());
    break;

  case "down":
    await printResults(migrator.migrateDown());
    break;

  default:
    throw new Error(
      `Invalid choice ${choice} (choose from: ${opts.join(", ")}})`
    );
}

await db.destroy();
