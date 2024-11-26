import sodium from "sodium-native";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const configSchemas = z.object({
  environment: z
    .object({
      NODE_ENV: z.enum(["production", "development"]).default("development"),
    })
    .transform((env) => env.NODE_ENV),

  server: z
    .object({
      EG_PORT: z.coerce.number().int().min(1024).max(65535),
    })
    .transform((env) => ({ port: env.EG_PORT })),

  files: z
    .object({
      EG_FILES_BASE_URL: z.string(),
    })
    .transform((env) => ({ baseUrl: env.EG_FILES_BASE_URL })),

  s3: z
    .object({
      EG_S3_ENDPOINT: z.string().startsWith("https://"),
      EG_S3_REGION: z.string(),
      EG_S3_ACCESS_KEY_ID: z.string(),
      EG_S3_ACCESS_SECRET: z.string(),
      EG_S3_BUCKET: z.string(),
    })
    .transform((env) => ({
      endpoint: env.EG_S3_ENDPOINT,
      region: env.EG_S3_REGION,
      accessKeyId: env.EG_S3_ACCESS_KEY_ID,
      accessSecret: env.EG_S3_ACCESS_SECRET,
      bucket: env.EG_S3_BUCKET,
    })),

  db: z
    .object({
      EG_DB_URL: z.string().startsWith("postgres://"),
    })
    .transform((env) => ({ url: env.EG_DB_URL })),

  crypto: z
    .object({
      EG_SECRET_KEY: z
        .string()
        .base64()
        .transform((s) => Buffer.from(s, "base64"))
        .refine((buf) => buf.length == sodium.crypto_secretbox_KEYBYTES, {
          message: `key must be ${sodium.crypto_secretbox_KEYBYTES} bytes`,
        }),
    })
    .transform((env) => ({ secretKey: env.EG_SECRET_KEY })),

  umami: z
    .object({
      EG_UMAMI_SCRIPT_URL: z.string().startsWith("https://").optional(),
      EG_UMAMI_WEBSITE_ID: z.string().length(36).optional(),
      EG_UMAMI_SHARE_URL: z.string().startsWith("https://").optional(),
    })
    .transform((env) =>
      env.EG_UMAMI_SCRIPT_URL && env.EG_UMAMI_WEBSITE_ID
        ? {
            scriptUrl: env.EG_UMAMI_SCRIPT_URL,
            websiteId: env.EG_UMAMI_WEBSITE_ID,
            shareUrl: env.EG_UMAMI_SHARE_URL,
          }
        : null
    ),

  mapbox: z
    .object({
      EG_MAPBOX_TOKEN: z.string().startsWith("pk."),
    })
    .transform((env) => ({ token: env.EG_MAPBOX_TOKEN })),
});

type ConfigName = keyof z.output<typeof configSchemas>;

const parsedConfigs: {
  [Name in ConfigName]?: z.output<typeof configSchemas>[Name];
} = {};

const getConfig = <Name extends ConfigName>(name: Name) => {
  if (parsedConfigs[name] !== undefined) return parsedConfigs[name];

  type Schema = z.ZodSchema<z.output<typeof configSchemas>[Name]>;
  const schema = configSchemas.shape[name] as unknown as Schema;

  const { success, error, data } = schema.safeParse(process.env);
  if (!success) throw fromZodError(error, { prefix: "Config" });
  parsedConfigs[name] = data;
  return data;
};

export const getNodeEnv = () => getConfig("environment");
export const getServerConfig = () => getConfig("server");
export const getFilesConfig = () => getConfig("files");
export const getS3Config = () => getConfig("s3");
export const getDbConfig = () => getConfig("db");
export const getCryptoConfig = () => getConfig("crypto");
export const getUmamiConfig = () => getConfig("umami");
export const getMapboxConfig = () => getConfig("mapbox");
