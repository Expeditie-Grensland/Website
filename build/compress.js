import { globby } from "globby";
import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { chdir } from "node:process";
import { pipeline } from "node:stream/promises";
import { createBrotliCompress, createGzip, constants } from "node:zlib";

chdir("dist");

const transformers = [
  {
    extension: "gz",
    createTransform: () =>
      createGzip({
        level: constants.Z_MAX_LEVEL,
        memLevel: constants.Z_MAX_MEMLEVEL,
        windowBits: constants.Z_MAX_WINDOWBITS,
      }),
  },
  {
    extension: "br",
    createTransform: (size) =>
      createBrotliCompress({
        params: {
          [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
          [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
          [constants.BROTLI_PARAM_LGWIN]: constants.BROTLI_MAX_WINDOW_BITS,
          [constants.BROTLI_PARAM_SIZE_HINT]: size,
        },
      }),
  },
];

const filesToCompress = await globby([
  "static/**/*.{js,css,svg,html,xml,webmanifest}",
]);

for (const file of filesToCompress) {
  const size = (await stat(file)).size;

  for (const { extension, createTransform } of transformers) {
    const inStream = createReadStream(file);
    const outStream = createWriteStream(`${file}.${extension}`);
    await pipeline(inStream, createTransform(size), outStream);
  }
  console.log(
    `${file}{=> .${transformers.map(({ extension }) => extension).join(", .")}}`
  );
}
