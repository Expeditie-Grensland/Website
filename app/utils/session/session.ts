import type { SessionIdStorageStrategy } from "@remix-run/node";
import { createSessionStorage } from "@remix-run/node";
import { nanoid } from "nanoid";
import redis from "./redis";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_SECRET: string;
      SESSION_TTL: string;
    }
  }
}

type RedisSessionOptions = {
  cookie?: SessionIdStorageStrategy["cookie"];
};

const createRedisSessionStorage = ({ cookie }: RedisSessionOptions) =>
  createSessionStorage({
    cookie,
    async createData(data, expires) {
      let id, result;

      do {
        id = nanoid();

        result = await redis.set("exgrl-session:" + id, JSON.stringify(data), {
          NX: true,
          PX: expires && expires.getTime() - Date.now(),
        });
      } while (result !== "OK");

      return id;
    },
    async readData(id) {
      const result = await redis.get("exgrl-session:" + id);
      return result && JSON.parse(result);
    },
    async updateData(id, data, expires) {
      await redis.set("exgrl-session:" + id, JSON.stringify(data), {
        PX: expires && expires.getTime() - Date.now(),
      });
    },
    async deleteData(id) {
      await redis.del("exgrl-session:" + id);
    },
  });

const { getSession, commitSession, destroySession } = createRedisSessionStorage(
  {
    cookie: {
      name: "exgrl-session",
      maxAge: (parseInt(process.env.SESSION_TTL) || undefined),
      secrets: [process.env.SESSION_SECRET || "not_so_secret"],
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    },
  }
);

export { getSession, commitSession, destroySession };
