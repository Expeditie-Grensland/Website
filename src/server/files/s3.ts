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
import { config } from "../helpers/configHelper.js";
import { readFileHandleByChunk } from "./chunks.js";

const CHUNK_SIZE = 256 * 1024 * 1024;

const client = new S3Client({
  endpoint: config.EG_S3_ENDPOINT,
  region: config.EG_S3_REGION,
  credentials: {
    accessKeyId: config.EG_S3_ACCESS_KEY_ID,
    secretAccessKey: config.EG_S3_ACCESS_SECRET,
  },
});

export const getS3Files = async () => {
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: config.EG_S3_BUCKET,
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

export const getPrefixDate = async (prefix: string) =>
  (
    await client.send(
      new ListObjectsV2Command({
        Bucket: config.EG_S3_BUCKET,
        Prefix: prefix,
        MaxKeys: 1,
      })
    )
  ).Contents?.at(0)?.LastModified;

const uploadS3FileSingle = async (
  file: FileHandle,
  key: string,
  type: string
) => {
  const buffer = await file.readFile();

  await client.send(
    new PutObjectCommand({
      Bucket: config.EG_S3_BUCKET,
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
      Bucket: config.EG_S3_BUCKET,
      Key: key,
      ContentType: type,
    })
  );

  const completeParts: CompletedPart[] = [];

  await readFileHandleByChunk(file, CHUNK_SIZE, async (buffer, num) => {
    const partResponse = await client.send(
      new UploadPartCommand({
        Bucket: config.EG_S3_BUCKET,
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
      Bucket: config.EG_S3_BUCKET,
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
        Bucket: config.EG_S3_BUCKET,
        Prefix: prefix,
        ContinuationToken:
          (listResponse && listResponse.NextContinuationToken) || undefined,
        MaxKeys: 100,
      })
    );

    if (!listResponse.ContinuationToken) {
      const time = listResponse.Contents?.at(0)?.LastModified?.getTime() || 0;
      const daysAge = time && Math.floor((Date.now() - time) / 86_400_000);

      if (daysAge <= config.EG_S3_MIN_DELETE_AGE)
        throw new Error(
          `Bestand '${prefix}' is te jong om te verwijderen (${daysAge} dagen < ${config.EG_S3_MIN_DELETE_AGE} dagen)`
        );
    }

    await Promise.all(
      listResponse.Contents?.map(({ Key }) =>
        client.send(
          new DeleteObjectCommand({ Bucket: config.EG_S3_BUCKET, Key })
        )
      ) || []
    );
  } while (listResponse.IsTruncated);
};
