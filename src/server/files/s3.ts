import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { config } from "../helpers/configHelper.js";

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
