import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getFilesInDirHash } from "./hash.js";
import { uploadS3File } from "./s3.js";

export type Converter = {
  extension: string;
  convert: (inputFile: string, outputDir: string) => Promise<void>;
};

export type ConvertOutput = {
  dir: string;
  files: string[];
};

export const getConvertOutput = async (dir: string) => ({
  dir,
  files: (await readdir(dir, { withFileTypes: true }))
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .toSorted(),
});

export const convertFile = async (
  inputFile: string,
  converter: Converter
): Promise<ConvertOutput> => {
  let dir: string | undefined;
  try {
    dir = await mkdtemp(join(tmpdir(), "expeditiegrensland-"));
    await converter.convert(inputFile, dir);
    return getConvertOutput(dir);
  } catch (e) {
    if (dir) tryToDelete(dir);
    throw e;
  }
};

export const determinePrefix = async (
  name: string,
  { dir, files }: ConvertOutput,
  extension: string
) =>
  `${name}.${(await getFilesInDirHash(dir, files))
    .digest("hex")
    .slice(0, 10)}.${extension}`;

export const tryToDelete = async (dir: string) => {
  try {
    rm(dir, { recursive: true, force: true });
  } catch (_e) {}
};

export const uploadFiles = async (
  prefix: string,
  convOutput: ConvertOutput,
  onEachFile?: (file: string) => void
) => {
  for (const file of convOutput.files) {
    if (onEachFile) onEachFile(file);

    await uploadS3File(join(convOutput.dir, file), `${prefix}/${file}`);
  }
};

export const convertAndUploadFile = async (
  name: string,
  inputFile: string,
  converter: Converter
) => {
  const convOutput = await convertFile(inputFile, converter);
  const prefix = await determinePrefix(name, convOutput, converter.extension);
  await uploadFiles(prefix, convOutput);
  await tryToDelete(convOutput.dir);
  return prefix;
};
