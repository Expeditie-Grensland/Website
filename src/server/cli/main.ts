import select from "@inquirer/select";
import { getDb } from "../db/schema/database.js";

global.cliMode = true;

try {
  const command = await select({
    message: "Actie",
    choices: [
      { name: "Bestand converteren en uploaden", value: "files" },
      {
        name: "Bestanden converteren en uploaden per partij",
        value: "filesBatch",
      },
    ],
  });

  getDb();

  await import(`./${command}.js`);
} catch (err) {
  console.error("Er is een fout opgetreden.");
  console.error(err instanceof Error ? err.message : String(err));
} finally {
  await getDb().destroy();
}
