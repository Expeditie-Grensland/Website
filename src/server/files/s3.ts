import {
  CompleteMultipartUploadCommand,
  CompletedPart,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import mime from "mime";
import { FileHandle, open } from "node:fs/promises";
import { getS3Config } from "../helpers/config.js";
import { readFileHandleByChunk } from "./chunks.js";

const CHUNK_SIZE = 256 * 1024 * 1024;

const client = new S3Client({
  endpoint: getS3Config().endpoint,
  region: getS3Config().region,
  credentials: {
    accessKeyId: getS3Config().accessKeyId,
    secretAccessKey: getS3Config().accessSecret,
  },
});

export const getS3Files = async () => {
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: getS3Config().bucket,
      Delimiter: "/",
    })
  );

  return (
    response.CommonPrefixes?.reduce(
      (dirs, cp) =>
        cp.Prefix && cp.Prefix.endsWith("/") && cp.Prefix.indexOf(".") > -1
          ? [...dirs, cp.Prefix.slice(0, -1)]
          : dirs,
      [] as string[]
    ) || []
  ).sort();
};

const uploadS3FileSingle = async (
  file: FileHandle,
  key: string,
  type: string
) => {
  const buffer = await file.readFile();

  await client.send(
    new PutObjectCommand({
      Bucket: getS3Config().bucket,
      Key: key,
      Body: buffer,
      ContentType: type,
    })
  );
};

const uploadS3FileMultiPart = async (
  file: FileHandle,
  key: string,
  type: string
) => {
  const createResponse = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: getS3Config().bucket,
      Key: key,
      ContentType: type,
    })
  );

  const completeParts: CompletedPart[] = [];

  await readFileHandleByChunk(file, CHUNK_SIZE, async (buffer, num) => {
    const partResponse = await client.send(
      new UploadPartCommand({
        Bucket: getS3Config().bucket,
        Key: key,
        UploadId: createResponse.UploadId!,
        PartNumber: num + 1,
        Body: buffer,
      })
    );

    completeParts.push({ PartNumber: num + 1, ETag: partResponse.ETag! });
  });

  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: getS3Config().bucket,
      Key: key,
      UploadId: createResponse.UploadId!,
      MultipartUpload: {
        Parts: completeParts,
      },
    })
  );
};

export const uploadS3File = async (fileName: string, key: string) => {
  const file = await open(fileName, "r");
  const type = mime.getType(fileName) || "application/octet-stream";

  if ((await file.stat()).size > CHUNK_SIZE)
    await uploadS3FileMultiPart(file, key, type);
  else await uploadS3FileSingle(file, key, type);

  file.close();
};

export const deleteS3Prefix = async (prefix: string) => {
  let listResponse: ListObjectsV2CommandOutput | undefined;

  do {
    listResponse = await client.send(
      new ListObjectsV2Command({
        Bucket: getS3Config().bucket,
        Prefix: prefix,
        ContinuationToken:
          (listResponse && listResponse.NextContinuationToken) || undefined,
        MaxKeys: 100,
      })
    );

    await Promise.all(
      listResponse.Contents?.map(({ Key }) =>
        client.send(
          new DeleteObjectCommand({ Bucket: getS3Config().bucket, Key })
        )
      ) || []
    );
  } while (listResponse.IsTruncated);
};
