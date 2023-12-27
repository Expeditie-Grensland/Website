import inquirer, { QuestionCollection } from "inquirer";
import inquirerFileTreeSelection from "inquirer-file-tree-selection-prompt";
import mongoose from "mongoose";
import { config } from "../helpers/configHelper.js";

console.info("Connecting to database...");
await mongoose.connect(config.EG_MONGO_URL);

inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);

type AnswersType = {
  commando: "files";
};

const questions: QuestionCollection<AnswersType> = {
  name: "commando",
  message: "Actie",
  type: "list",
  choices: [{ name: "Bestand converteren en uploaden", value: "files" }],
};

const answers = await inquirer.prompt(questions);

switch (answers.commando) {
  case "files":
    await import("./files.js");
    break;
}

await mongoose.disconnect();
