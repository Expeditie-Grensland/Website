import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development"]).default("development"),

  EG_PORT: z.coerce.number().int().min(1024).max(65535),

  EG_FILES_BASE_URL: z.string(),
  EG_S3_ENDPOINT: z.string().startsWith("https://"),
  EG_S3_REGION: z.string(),
  EG_S3_ACCESS_KEY_ID: z.string(),
  EG_S3_ACCESS_SECRET: z.string(),
  EG_S3_BUCKET: z.string(),
  EG_S3_MIN_DELETE_AGE: z.coerce.number().int().default(90),

  EG_DB_URL: z.string().startsWith("postgres://"),
  EG_MONGO_URL: z.string().startsWith("mongodb://").optional(),

  EG_LDAP_URL: z.string().startsWith("ldap"),
  EG_LDAP_BIND_DN: z.string(),
  EG_LDAP_BIND_CREDENTIALS: z.string(),
  EG_LDAP_SEARCH_BASE: z.string(),
  EG_LDAP_SEARCH_SCOPE: z.enum(["base", "one", "sub"]),
  EG_LDAP_SEARCH_FILTER: z.string(),
  EG_LDAP_ID_FIELD: z.string(),

  EG_SESSION_SECRET: z.string().min(128),

  EG_UMAMI_SCRIPT_URL: z.string().startsWith("https://").optional(),
  EG_UMAMI_WEBSITE_ID: z.string().length(36).optional(),
  EG_UMAMI_SHARE_URL: z.string().startsWith("https://").optional()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success)
  throw fromZodError(parsedEnv.error, { prefix: "Config" });

export const config = parsedEnv.data;
