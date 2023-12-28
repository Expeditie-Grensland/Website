import inquirer, { QuestionCollection } from "inquirer";
import inquirerFileTreeSelection from "inquirer-file-tree-selection-prompt";
import mongoose from "mongoose";
import { config } from "../helpers/configHelper.js";

global.cliMode = true;

try {
  console.info("Connecting to database...");
  await mongoose.connect(config.EG_MONGO_URL);

  inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);

  type AnswersType = {
    commando: "files" | "filesBatch";
  };

  const questions: QuestionCollection<AnswersType> = {
    name: "commando",
    message: "Actie",
    type: "list",
    choices: [
      { name: "Bestand converteren en uploaden", value: "files" },
      {
        name: "Bestanden converteren en uploaden per partij",
        value: "filesBatch",
      },
    ],
  };

  const answers = await inquirer.prompt(questions);

  await import(`./${answers.commando}.js`);
} catch (err) {
  console.error("Er is een fout opgetreden.");
  console.error(err instanceof Error ? err.message : String(err));
} finally {
  await mongoose.disconnect();
}
