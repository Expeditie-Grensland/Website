import { type FileHandle, open } from "node:fs/promises";
import {
  type CompletedPart,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import mime from "mime";
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
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export const getS3Files = async () => {
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: getS3Config().bucket,
      Delimiter: "/",
    })
  );

  return (
    response.CommonPrefixes?.filter(
      (cp): cp is { Prefix: string } =>
        !!cp.Prefix && cp.Prefix.endsWith("/") && cp.Prefix.includes(".")
    )
      .map((cp) => cp.Prefix.slice(0, -1))
      .sort() || []
  );
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
        ContinuationToken: listResponse?.NextContinuationToken,
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
