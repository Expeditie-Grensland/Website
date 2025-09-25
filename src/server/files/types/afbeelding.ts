import { join } from "node:path";
import { runProcess } from "../../helpers/process.js";
import type { Converter } from "../convert.js";

const convert = async (inputFile: string, outputDir: string) =>
  await runProcess("magick", [
    inputFile,
    ["-colorspace", "sRGB"],
    ["-sampling-factor", "4:2:0"],
    ["-strip"],
    ["-quality", "100"],
    ["-write", join(outputDir, "origineel.jpg")],
    ["-quality", "80"],
    ...[
      { name: "normaal", size: "1500>" },
      { name: "klein", size: "500>" },
      { name: "miniscuul", size: "30" },
    ].flatMap(({ name, size }) => [
      "(",
      "+clone",
      ["-thumbnail", size],
      ["-write", join(outputDir, `${name}.webp`)],
      ["-write", join(outputDir, `${name}.jpg`)],
      "+delete",
      ")",
    ]),
    ["-write", join(outputDir, "volledig.webp")],
    join(outputDir, "volledig.jpg"),
  ]);

export const convertAfbeelding: Converter = {
  extension: "afbeelding",
  convert,
};
