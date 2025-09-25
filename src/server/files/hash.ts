import { createHash, type Hash } from "node:crypto";
import { join } from "node:path";
import { readFileByChunk } from "./chunks.js";

const CHUNK_SIZE = 256 * 1024 * 1024;

const newHash = () => createHash("md5");

const getFileHash = async (fileName: string, inHash?: Hash) => {
  const hash = inHash || newHash();

  await readFileByChunk(fileName, CHUNK_SIZE, async (buffer) => {
    hash.update(buffer);
  });

  return hash;
};

export const getFilesInDirHash = async (
  dir: string,
  files: string[],
  inHash?: Hash
) => {
  const hash = inHash || newHash();

  for (const file of files) {
    hash.update(file);
    await getFileHash(join(dir, file), hash);
  }

  return hash;
};
