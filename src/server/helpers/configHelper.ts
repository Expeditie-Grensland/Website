import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development"]).default("development"),

  EG_PORT: z.union([z.coerce.number().int(), z.string()]),

  EG_FILES_BASE_URL: z.string(),
  EG_FILES_S3_ENDPOINT: z.string().startsWith("https://"),
  EG_FILES_S3_REGION: z.string(),
  EG_FILES_S3_ACCESS_KEY_ID: z.string(),
  EG_FILES_S3_ACCESS_SECRET: z.string(),
  EG_FILES_S3_BUCKET: z.string(),

  EG_MONGO_URL: z.string().startsWith("mongodb://"),

  EG_LDAP_URL: z.string().startsWith("ldap"),
  EG_LDAP_BIND_DN: z.string(),
  EG_LDAP_BIND_CREDENTIALS: z.string(),
  EG_LDAP_SEARCH_BASE: z.string(),
  EG_LDAP_SEARCH_SCOPE: z.enum(["base", "one", "sub"]),
  EG_LDAP_SEARCH_FILTER: z.string(),
  EG_LDAP_ID_FIELD: z.string(),

  EG_REDIS_URL: z.string().startsWith("redis://").optional(),
  EG_REDIS_PREFIX: z.string().default("expeditie-grensland:"),

  EG_SESSION_SECRET: z.string().min(128),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success)
  throw fromZodError(parsedEnv.error, { prefix: "Config" });

export const config = parsedEnv.data;
