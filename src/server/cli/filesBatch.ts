import { access, constants, readFile, stat } from "fs/promises";
import inquirer, { QuestionCollection } from "inquirer";
import { dirname, join } from "path";
import { z } from "zod";
import { convertAndUploadFile } from "../files/convert.js";
import { allConverters } from "../files/types/index.js";

type AnswersType = {
  bron: string;
};

const questions: QuestionCollection<AnswersType> = [
  {
    name: "bron",
    message: "Bronbestand (JSON)",
    type: "file-tree-selection",
    enableGoUpperDirectory: true,
    validate: async (input: string) => {
      try {
        await access(input, constants.R_OK);
        return (await stat(input)).isFile();
      } catch (err) {
        return false;
      }
    },
  },
];

const answers = await inquirer.prompt(questions);

const batchFormat = z.array(
  z.object({
    converteerder: z
      .enum(["achtergrond", "afbeelding", "video", "audio"])
      .transform((x) => allConverters[x]),
    bestand: z.string(),
    beschrijving: z.string().regex(/^([a-z0-9]+-)*[a-z0-9]+$/),
  })
);

const items = batchFormat.parse(
  JSON.parse(await readFile(answers.bron, "utf-8"))
);

type ConvertedItems = { bestand: string } & (
  | { sleutel: string }
  | { error: string }
);

const convertedItems: ConvertedItems[] = [];

for (const { converteerder, bestand, beschrijving } of items) {
  try {
    console.info(`Te converteren bestand: '${bestand}'`);
    const sleutel = await convertAndUploadFile(
      beschrijving,
      join(dirname(answers.bron), bestand),
      converteerder
    );

    convertedItems.push({ bestand, sleutel });
  } catch (err) {
    convertedItems.push({
      bestand,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

console.info("Geconverteerde bestanden:");
console.info(JSON.stringify(convertedItems, undefined, 2));
