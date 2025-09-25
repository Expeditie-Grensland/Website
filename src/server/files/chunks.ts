import { type FileHandle, open } from "node:fs/promises";

export const readFileHandleByChunk = async (
  file: FileHandle,
  chunkSize: number,
  withBuffer: (buffer: Buffer, num: number) => Promise<void>
) => {
  const buffer = Buffer.allocUnsafe(chunkSize);
  let num = 0;

  while (true) {
    const { bytesRead } = await file.read(buffer, 0, chunkSize);
    if (!bytesRead) break;

    await withBuffer(buffer.subarray(0, bytesRead), num++);
  }
};

export const readFileByChunk = async (
  fileName: string,
  chunkSize: number,
  withBuffer: (buffer: Buffer, num: number) => Promise<void>
) => {
  const file = await open(fileName, "r");
  await readFileHandleByChunk(file, chunkSize, withBuffer);
  file?.close();
};
