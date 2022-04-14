import type { RedisClientType } from "@node-redis/client";
import { createClient } from "redis";

let redis: RedisClientType;

declare global {
  var __redis: RedisClientType | undefined;
}

if (process.env.NODE_ENV === "production") {
  redis = createClient({ url: process.env.SESSION_URL as string });
  redis.connect();
} else {
  if (!global.__redis) {
    global.__redis = createClient({ url: process.env.SESSION_URL as string });
    global.__redis.connect();
  }
  redis = global.__redis;
}

export default redis;
