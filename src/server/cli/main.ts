#!/usr/bin/env node

import select from "@inquirer/select";
import mongoose from "mongoose";
import { config } from "../helpers/configHelper.js";

global.cliMode = true;

try {
  console.info("Connecting to database...");
  await mongoose.connect(config.EG_MONGO_URL);

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

  await import(`./${command}.js`);
} catch (err) {
  console.error("Er is een fout opgetreden.");
  console.error(err instanceof Error ? err.message : String(err));
} finally {
  await mongoose.disconnect();
}
