import inquirer, { QuestionCollection } from "inquirer";
import { access, constants, stat } from "node:fs/promises";
import { getAllExpedities } from "../components/expedities/index.js";
import { convertAchtergrond } from "../files/types/achtergrond.js";
import { convertAfbeelding } from "../files/types/afbeelding.js";
import {
  Converter,
  convertFile,
  determinePrefix,
  tryToDelete,
  uploadFiles,
} from "../files/convert.js";
import { convertAudio } from "../files/types/audio.js";
import { convertVideo } from "../files/types/video.js";

type AnswersType = {
  type: "film" | "achtergrond" | "afbeelding" | "video" | "audio";
  bijlageVan?: "verhaal" | "woord" | "citaat";
  expeditie?: string;
  beschrijving?: string;
  bron: string;
};

const questions: QuestionCollection<AnswersType> = [
  {
    name: "type",
    message: "Type bestand",
    type: "list",
    choices: [
      { name: "Expeditie-film", value: "film" },
      { name: "Expeditie-achtergrond", value: "achtergrond" },
      {
        name: "Afbeelding-bijlage (voor verhaal, woord of citaat)",
        value: "afbeelding",
      },
      {
        name: "Video-bijlage (voor verhaal, woord of citaat)",
        value: "video",
      },
      {
        name: "Audio-bijlage (voor verhaal, woord of citaat)",
        value: "audio",
      },
    ],
  },
  {
    name: "bijlageVan",
    message: "Bijlage van",
    when: ({ type }) =>
      type === "afbeelding" || type === "video" || type === "audio",
    type: "list",
    choices: [
      { name: "Verhaal", value: "verhaal" },
      { name: "Woord", value: "woord" },
      { name: "Citaat", value: "citaat" },
    ],
  },
  {
    name: "expeditie",
    message: "Expeditie",
    when: ({ type, bijlageVan }) =>
      type === "film" || type === "achtergrond" || bijlageVan === "verhaal",
    type: "list",
    loop: false,
    choices: async () =>
      (await getAllExpedities()).map((exp) => ({
        name: exp.name,
        value: exp.nameShort,
      })),
  },
  {
    name: "beschrijving",
    message: "Bestandsnaam (beknopte beschrijving)",
    when: ({ type }) =>
      type === "afbeelding" || type === "video" || type === "audio",
    type: "input",
    transformer: (input: string, answers) =>
      answersToName({ ...answers, beschrijving: input }),
    validate: (input: string) =>
      /^([a-z0-9]+-)*[a-z0-9]+$/.test(input) ||
      "Moet bestaan uit a-z en 0-9, gescheiden met -",
  },
  {
    name: "bron",
    message: "Bronbestand",
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

const answersToName = ({
  type,
  beschrijving,
  bijlageVan,
  expeditie,
}: AnswersType) => {
  if (type === "film" || type === "achtergrond") return expeditie as string;
  if (bijlageVan === "verhaal") return `${expeditie}-verhaal-${beschrijving}`;
  if (bijlageVan === "woord") return `woord-${beschrijving}`;
  if (bijlageVan === "citaat") return `citaat-${beschrijving}`;
  return beschrijving as string;
};

const answers = await inquirer.prompt(questions);

const converter = (
  {
    film: undefined,
    achtergrond: convertAchtergrond,
    afbeelding: convertAfbeelding,
    video: convertVideo,
    audio: convertAudio,
  } satisfies Record<AnswersType["type"], Converter | undefined>
)[answers.type];

if (!converter) throw new Error("Converteerder niet geïmplementeerd!");

const name = answersToName(answers);

await inquirer.prompt([
  {
    name: "confirm",
    message: "De conversie starten?",
    type: "list",
    choices: [{ name: "Ja", value: true }],
  },
] as QuestionCollection<{ confirm: true }>);

const convOutput = await convertFile(answers.bron, converter);
const prefix = await determinePrefix(name, convOutput, converter.extension);

const uploadConfirm = await inquirer.prompt([
  {
    name: "confirm",
    message: `De geconverteerde bestanden (in '${convOutput.dir}') uploaden met de prefix '${prefix}'?`,
    type: "list",
    choices: [
      { name: "Ja", value: true },
      { name: "Nee", value: false },
    ],
  },
] as QuestionCollection<{ confirm: boolean }>);

if (uploadConfirm.confirm) await uploadFiles(prefix, convOutput);

const deleteConfirm = await inquirer.prompt([
  {
    name: "confirm",
    message: `De geconverteerde bestanden (in '${convOutput.dir}') verwijderen?'`,
    type: "list",
    choices: [
      { name: "Ja", value: true },
      { name: "Nee", value: false },
    ],
  },
] as QuestionCollection<{ confirm: boolean }>);

if (deleteConfirm.confirm) await tryToDelete(convOutput.dir);
