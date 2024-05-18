import { FileMigrationProvider, Migrator } from "kysely";
import db from "./database";
import path from "node:path";
import fs from "node:fs/promises";

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    path,
    fs,
    migrationFolder: path.join(import.meta.dirname, "migrations"),
  }),
});

export default migrator;
