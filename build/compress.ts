import { globby } from "globby";
import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { chdir } from "node:process";
import { pipeline } from "node:stream/promises";
import { constants, createBrotliCompress, createGzip } from "node:zlib";
import { endBuildScript, startBuildScript } from "./common/build-script";

startBuildScript();

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
    createTransform: (size: number) =>
      createBrotliCompress({
        params: {
          [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
          [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
          [constants.BROTLI_PARAM_LGWIN]: constants.BROTLI_MAX_WINDOW_BITS,
          [constants.BROTLI_PARAM_SIZE_HINT]: size,
        },
      }),
  },
] as const;

chdir("dist/static");

const filesToCompress = await globby("**/*.{js,css,svg,html,xml,webmanifest}");

for (const file of filesToCompress) {
  const size = (await stat(file)).size;

  for (const { extension, createTransform } of transformers) {
    const inStream = createReadStream(file);
    const outStream = createWriteStream(`${file}.${extension}`);
    await pipeline(inStream, createTransform(size), outStream);
  }

  console.info(
    `${file}{=> .${transformers.map((tf) => tf.extension).join(", .")}}`
  );
}

endBuildScript();
