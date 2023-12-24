import inquirer from "inquirer";
import { getAllExpedities } from "../components/expedities/index.js";
import { stat, constants, access } from "node:fs/promises";

export const filesCli = async () => {
  const answers = await inquirer.prompt([
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
        (
          await getAllExpedities()
        ).map((exp) => ({ name: exp.name, value: exp.nameShort })),
    },
    {
      name: "beschrijving",
      message: "Bestandsnaam (beknopte beschrijving)",
      when: ({ type }) =>
        type === "afbeelding" || type === "video" || type === "audio",
      type: "input",
      transformer: (input: string, { bijlageVan, expeditie }) =>
        bijlageVan === "verhaal"
          ? `${expeditie}-verhaal-${input}`
          : bijlageVan === "woord"
          ? `woord-${input}`
          : bijlageVan === "citaat"
          ? `citaat-${input}`
          : input,
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
  ]);

  console.dir(answers);
  return;
};
