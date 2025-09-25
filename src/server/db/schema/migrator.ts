import fs from "node:fs/promises";
import path from "node:path";
import { FileMigrationProvider, Migrator } from "kysely";
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
