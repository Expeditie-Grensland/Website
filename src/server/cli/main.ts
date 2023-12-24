import inquirer from "inquirer";
import inquirerFileTreeSelection from "inquirer-file-tree-selection-prompt";
import mongoose from "mongoose";
import { filesCli } from "./files.js";
import { config } from "../helpers/configHelper.js";

console.info("Connecting to database...");
await mongoose.connect(config.EG_MONGO_URL);

inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);

const answers = await inquirer.prompt({
  name: "commando",
  message: "Actie",
  type: "list",
  choices: [{ name: "Bestand converteren en uploaden", value: "files" }],
});

if (answers.commando === "files") await filesCli();

await mongoose.disconnect();
