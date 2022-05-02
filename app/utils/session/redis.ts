import { createClient } from "redis";
import type { RedisClientType } from "redis";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REDIS_URL: string;
    }
  }
}

let redis: RedisClientType;

declare global {
  var __redis: RedisClientType | undefined;
}

if (!global.__redis) {
  redis = createClient({ url: process.env.REDIS_URL });
  redis.connect();

  if (process.env.NODE_ENV === "development") global.__redis = redis;
} else redis = global.__redis;

export default redis;
