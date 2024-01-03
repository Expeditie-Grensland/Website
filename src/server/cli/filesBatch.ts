import input from "@inquirer/input";
import { readFile } from "node:fs/promises";
import { dirname, join } from "path";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import { convertAndUploadFile } from "../files/convert.js";
import { allConverters } from "../files/types/index.js";

const manifestFormat = z.array(
  z.object({
    converteerder: z
      .enum(["achtergrond", "afbeelding", "video", "audio"])
      .transform((x) => allConverters[x]),
    bestand: z.string(),
    beschrijving: z.string().regex(/^([a-z0-9]+-)*[a-z0-9]+$/),
  })
);

const readManifest = async (fileName: string) =>
  manifestFormat.parse(JSON.parse(await readFile(fileName, "utf-8")));

const manifest = await input({
  message: "Bronbestand (JSON)",
  validate: async (value) => {
    try {
      await readManifest(value);
      return true;
    } catch (e) {
      if (e instanceof SyntaxError)
        return "Bestand bevat geen geldige JSON-syntax";
      if (e instanceof ZodError)
        return `Bestand bevat geen geldige indeling: '${fromZodError(e, {
          prefix: null,
        })}'`;
      return "Bestand kan niet worden gelezen";
    }
  },
});

const items = await readManifest(manifest);

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
      join(dirname(manifest), bestand),
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
