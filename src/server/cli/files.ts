import input from "@inquirer/input";
import select from "@inquirer/select";
import { access, constants, stat } from "node:fs/promises";
import { getAllExpedities } from "../components/expedities/index.js";
import {
  ConvertOutput,
  convertFile,
  determinePrefix,
  getConvertOutput,
  tryToDelete,
  uploadFiles,
} from "../files/convert.js";
import { convertFilm } from "../files/types/film.js";
import { allConverters } from "../files/types/index.js";

const type: "film" | "afbeelding" | "video" | "audio" = await select({
  message: "Type bestand",
  choices: [
    { name: "Expeditie-film", value: "film" },
    {
      name: "Afbeelding-bijlage (voor achtergrond, verhaal, woord of citaat)",
      value: "afbeelding",
    },
    {
      name: "Video-bijlage (voor verhaal, woord of citaat)",
      value: "video",
    },
    {
      name: "Audio-bijlage (voor woord of citaat)",
      value: "audio",
    },
  ],
});

let itemType: "verhaal" | "woord" | "citaat" | "achtergrond" | undefined;

const choicesByType = {
  afbeelding: [
    { name: "Achtergrond", value: "achtergrond" },
    { name: "Verhaal", value: "verhaal" },
    { name: "Woord", value: "woord" },
    { name: "Citaat", value: "citaat" },
  ],
  video: [
    { name: "Verhaal", value: "verhaal" },
    { name: "Woord", value: "woord" },
    { name: "Citaat", value: "citaat" },
  ],
  audio: [
    { name: "Woord", value: "woord" },
    { name: "Citaat", value: "citaat" },
  ],
} as const;

if (type == "afbeelding" || type == "video" || type == "audio")
  itemType = await select({
    message: `Doel van de ${type}`,
    choices: choicesByType[type],
  });

let expeditie: string | undefined;

if (type == "film" || itemType == "achtergrond" || itemType == "verhaal")
  expeditie = await select({
    message: "Expeditie",
    loop: false,
    choices: (
      await getAllExpedities()
    ).map((x) => ({ name: x.name, value: x.nameShort })),
  });

const answersToName = (description: string) => {
  if (type == "film") return expeditie as string;
  if (itemType == "achtergrond") return `${expeditie}-achtergrond`;
  if (itemType == "verhaal") return `${expeditie}-verhaal-${description}`;
  if (itemType == "woord") return `woord-${description}`;
  if (itemType == "citaat") return `citaat-${description}`;
  return description as string;
};

const name = answersToName(
  (type == "afbeelding" || type == "video" || type == "audio") &&
    itemType != "achtergrond"
    ? await input({
        message: "Bestandsnaam (beknopte beschrijving)",
        transformer: answersToName,
        validate: (value) =>
          /^([a-z0-9]+-)*[a-z0-9]+$/.test(value) ||
          "Moet bestaan uit a-z en 0-9, gescheiden met -",
      })
    : ""
);

const noConversion = await select({
  message: "Conversie overslaan (bestand is al geconverteerd)?",
  choices: [
    { name: "Nee", value: false },
    { name: "Ja", value: true },
  ],
});

const removeQuotes = (str: string) =>
  str.replace(/^"(.+)"$/, "$1").replace(/^'(.+)'$/, "$1");

const sourceFile = removeQuotes(
  await input({
    message: "Pad naar bronbestand",
    validate: async (value) => {
      const path = removeQuotes(value);

      try {
        await access(path, constants.R_OK);
        const s = await stat(path);

        if (noConversion)
          return s.isDirectory() || "Pad wijst niet naar een map";
        return s.isFile() || "Pad wijst niet naar een bestand";
      } catch {
        return "Pad kan niet worden geopend";
      }
    },
  })
);

const converter =
  type == "film"
    ? convertFilm(
        !noConversion
          ? {
              resolution: await select({
                message: "Filmresolutie",
                choices: [
                  { name: "2160p (4K)", value: 2160 },
                  { name: "1440p (QHD)", value: 1440 },
                  { name: "1080p (FHD)", value: 1080 },
                  { name: "720p (HD)", value: 720 },
                ],
                default: 1080,
              }),
              fps: await select({
                message: "Framerate",
                choices: [
                  { name: "60 fps", value: 60 },
                  { name: "30 fps", value: 30 },
                ],
              }),
              audioBitrate: await select({
                message: "Audio bitrate",
                choices: [
                  { name: "192 kb/s", value: 192 },
                  { name: "128 kb/s", value: 128 },
                ],
                default: 128,
              }),
              posterTime: parseFloat(
                await input({
                  message: "Tijd voor posterafbeelding (in seconden)",
                  validate: (value) =>
                    /^(?:[0-9]+\.?)|(?:[0-9]*\.[0-9]+)$/.test(value) ||
                    "Tijd is geen positief getal",
                })
              ),
            }
          : undefined
      )
    : allConverters[type];

let convOutput: ConvertOutput;

if (!noConversion) {
  await select({
    message: "De conversie starten?",
    choices: [{ name: "Ja", value: true }],
  });

  convOutput = await convertFile(sourceFile, converter);

  console.info(`Successvol geconverteerd naar '${convOutput.dir}'`);
} else {
  convOutput = await getConvertOutput(sourceFile);
}

await select({
  message: `Doorgaan met de prefix berekenen?`,
  choices: [{ name: "Ja", value: true }],
});

const prefix = await determinePrefix(name, convOutput, converter.extension);

const uploadConfirm = await select({
  message: `De geconverteerde bestanden uploaden met de sleutelprefix '${prefix}'?`,
  choices: [
    { name: "Ja", value: true },
    { name: "Nee", value: false },
  ],
});

if (uploadConfirm) {
  const fileCount = convOutput.files.length.toString();
  let fileNum = 1;

  await uploadFiles(prefix, convOutput, (file) =>
    console.info(
      `(${(fileNum++)
        .toString()
        .padStart(fileCount.length)}/${fileCount}) ${file}`
    )
  );

  console.info(`Successvol geüpload met de sleutelprefix '${prefix}'`);

  const deleteConfirm = await select({
    message: "De lokale bestanden verwijderen?",
    choices: [
      { name: "Ja", value: true },
      { name: "Nee", value: false },
    ],
  });

  if (deleteConfirm) await tryToDelete(convOutput.dir);
}
