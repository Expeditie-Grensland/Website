import { createSessionStorage } from "@remix-run/node";
import { nanoid } from "nanoid";
import db from "../database/db";
import redis from "./redis";
import type { SessionIdStorageStrategy } from "@remix-run/node";

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

const serialise = ({ user, ...data }: any) =>
  JSON.stringify({
    ...data,
    ...(user ? { user: user.id } : {}),
  });

const deserialise = async (dbData: string) => {
  const { user: userId, ...data } = JSON.parse(dbData);

  return {
    ...data,
    ...(userId
      ? { user: await db.person.findUnique({ where: { id: userId } }) }
      : {}),
  };
};

const createRedisSessionStorage = ({ cookie }: RedisSessionOptions) =>
  createSessionStorage({
    cookie,
    async createData(data, expires) {
      let id, result;

      do {
        id = nanoid();

        result = await redis.set("exgrl-session:" + id, serialise(data), {
          NX: true,
          PX: expires && expires.getTime() - Date.now(),
        });
      } while (result !== "OK");

      return id;
    },
    async readData(id) {
      const result = await redis.get("exgrl-session:" + id);
      return result && deserialise(result);
    },
    async updateData(id, data, expires) {
      await redis.set("exgrl-session:" + id, serialise(data), {
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
      maxAge: parseInt(process.env.SESSION_TTL) || undefined,
      secrets: [process.env.SESSION_SECRET || "not_so_secret"],
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    },
  }
);

const getSessionFromRequest = async (request: Request) =>
  await getSession(request?.headers?.get("Cookie"));

export { getSession, commitSession, destroySession, getSessionFromRequest };
