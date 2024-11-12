import sodium from "sodium-native";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["production", "development"]).default("development"),

    EG_PORT: z.coerce.number().int().min(1024).max(65535),

    EG_FILES_BASE_URL: z.string(),
    EG_S3_ENDPOINT: z.string().startsWith("https://"),
    EG_S3_REGION: z.string(),
    EG_S3_ACCESS_KEY_ID: z.string(),
    EG_S3_ACCESS_SECRET: z.string(),
    EG_S3_BUCKET: z.string(),

    EG_DB_URL: z.string().startsWith("postgres://"),

    EG_SECRET_KEY: z
      .string()
      .base64()
      .transform((s) => Buffer.from(s, "base64"))
      .refine((buf) => buf.length == sodium.crypto_secretbox_KEYBYTES, {
        message: `key must be ${sodium.crypto_secretbox_KEYBYTES} bytes`,
      }),

    EG_UMAMI_SCRIPT_URL: z.string().startsWith("https://").optional(),
    EG_UMAMI_WEBSITE_ID: z.string().length(36).optional(),
    EG_UMAMI_SHARE_URL: z.string().startsWith("https://").optional(),

    EG_MAPBOX_TOKEN: z.string().startsWith("pk."),
  })
  .catchall(z.string().optional());

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success)
  throw fromZodError(parsedEnv.error, { prefix: "Config" });

export const config = parsedEnv.data;
