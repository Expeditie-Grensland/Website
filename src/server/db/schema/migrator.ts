import { FileMigrationProvider, Migrator } from "kysely";
import fs from "node:fs/promises";
import path from "node:path";
import { getDb } from "./database.js";

let migrator: Migrator;

export const getMigrator = () => {
  if (!migrator) {
    migrator = new Migrator({
      db: getDb(),
      provider: new FileMigrationProvider({
        path,
        fs,
        migrationFolder: path.join(import.meta.dirname, "migrations"),
      }),
    });
  }

  return migrator;
};
