import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

import { config } from "./configHelper.js";

export const getFileUrl = (file: string) =>
  `${config.EG_FILES_BASE_URL}/${file}`;

const client = new S3Client({
  endpoint: config.EG_FILES_S3_ENDPOINT,
  region: config.EG_FILES_S3_REGION,
  credentials: {
    accessKeyId: config.EG_FILES_S3_ACCESS_KEY_ID,
    secretAccessKey: config.EG_FILES_S3_ACCESS_SECRET,
  },
});

export const getFileList = async () => {
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: config.EG_FILES_S3_BUCKET,
      Delimiter: "/",
    })
  );

  return [
    ...(response.CommonPrefixes?.reduce(
      (dirs, cp) =>
        cp.Prefix && cp.Prefix.endsWith("/") && cp.Prefix.indexOf(".") > -1
          ? [...dirs, cp.Prefix!.slice(0, -1)]
          : dirs,
      [] as string[]
    ) || []),
    ...(response.Contents || []).reduce(
      (files, item) =>
        item.Key && !item.Key.endsWith("/") && item.Key.indexOf(".") > -1
          ? [...files, item.Key]
          : files,
      [] as string[]
    ),
  ];
};

export const getFileType = (file: string) =>
  file.slice(file.lastIndexOf(".") + 1);
