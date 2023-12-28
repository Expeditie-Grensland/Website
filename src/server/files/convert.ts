import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { config } from "../helpers/configHelper.js";

export type Converter = {
  extension: string;
  convert: (inputFile: string, outputDir: string) => Promise<void>;
};

export type ConvertOutput = {
  dir: string;
  files: string[];
};

export const convertFile = async (
  inputFile: string,
  converter: Converter
): Promise<ConvertOutput> => {
  let dir: string | undefined;
  try {
    dir = await mkdtemp(join(tmpdir(), "expeditiegrensland-"));
    await converter.convert(inputFile, dir);

    const files = (await readdir(dir, { withFileTypes: true }))
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name)
      .toSorted();

    return {
      dir,
      files,
    };
  } catch (e) {
    if (dir) tryToDelete(dir);
    throw e;
  }
};

export const calculateHash = async (convOutput: ConvertOutput) => {
  const hash = createHash("md5");

  for (const file of convOutput.files) {
    hash.update(file);
    hash.update(await readFile(join(convOutput.dir, file)));
  }

  return hash.digest("hex").slice(0, 10);
};

export const determinePrefix = async (
  name: string,
  convOutput: ConvertOutput,
  extension: string
) => `${name}.${await calculateHash(convOutput)}.${extension}`;

export const tryToDelete = async (dir: string) => {
  try {
    rm(dir, { recursive: true, force: true });
  } catch (e) {
    /* ignore */
  }
};

const client = new S3Client({
  endpoint: config.EG_S3_ENDPOINT,
  region: config.EG_S3_REGION,
  credentials: {
    accessKeyId: config.EG_S3_ACCESS_KEY_ID,
    secretAccessKey: config.EG_S3_ACCESS_SECRET,
  },
});

export const uploadFiles = async (
  prefix: string,
  convOutput: ConvertOutput
) => {
  for (const file of convOutput.files) {
    const command = new PutObjectCommand({
      Bucket: config.EG_S3_BUCKET,
      Key: `${prefix}/${file}`,
      Body: await readFile(join(convOutput.dir, file)),
    });
    await client.send(command);
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
