import fastifyCookie from "@fastify/cookie";
import fastifyFormbody from "@fastify/formbody";
import fastifySession, { FastifySessionOptions } from "@fastify/session";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import RedisStore from "connect-redis";
import fastify, { FastifyInstance } from "fastify";
import mongoose from "mongoose";
import { join } from "node:path";
import pug from "pug";
import redis from "redis";
import { getPersonById } from "../components/people/index.js";
import routes from "../routes/index.js";
import { config } from "./configHelper.js";
import { getFileUrl } from "./files.js";
import qs from "qs";

export const setupMongooose = async () => {
  mongoose.set("debug", config.NODE_ENV === "development");

  try {
    void (await mongoose.connect(config.EG_MONGO_URL));
    console.info("Connected to database");
  } catch (e) {
    console.error(`Connection error: ${e}`);
  }
};

const setupSession = async (app: FastifyInstance) => {
  const sessionOptions: FastifySessionOptions = {
    secret: config.EG_SESSION_SECRET,
    cookie: {
      secure: config.NODE_ENV === "production",
    },
    saveUninitialized: false,
  };

  if (config.EG_REDIS_URL) {
    const redisClient = redis.createClient({
      url: config.EG_REDIS_URL,
    });
    redisClient.connect().catch(console.error);

    sessionOptions.store = new RedisStore({
      client: redisClient,
      prefix: config.EG_REDIS_PREFIX,
      ttl: 2592000,
    });
  }

  await app.register(fastifyCookie);
  await app.register(fastifySession, sessionOptions);
};

const setupStaticRoutes = async (app: FastifyInstance) => {
  if (config.NODE_ENV === "development") {
    await app.register(fastifyStatic, {
      root: join(global.rootDir, "static"),
      prefix: "/static/",
    });

    Object.entries({
      "favicon.ico": "favicons/favicon.ico",
      "browserconfig.xml": "favicons/browserconfig.xml",
      "manifest.webmanifest": "favicons/manifest.webmanifest",
      "worker.js": "scripts/worker.js",
    }).forEach(([name, location]) => {
      app.get(`/${name}`, (request, reply) => {
        return reply.sendFile(join(global.rootDir, "static", location));
      });
    });
  }
};

export const setupFastify = async () => {
  const app = fastify({ logger: true });

  await app.register(fastifyView, {
    engine: { pug },
    root: join(global.rootDir, "views"),
    includeViewExtension: true,
  });

  await setupStaticRoutes(app);

  await app.register(fastifyFormbody, { parser: (str) => qs.parse(str) });

  await setupSession(app);

  app.addHook("onRequest", async (request, reply) => {
    reply.locals = {
      ...reply.locals,
      getFileUrl,
      user:
        (request.session.userId &&
          (await getPersonById(request.session.userId))) ||
        undefined,
    };
  });

  await app.register(routes);

  await app.ready();
  await app.listen(
    typeof config.EG_PORT === "number"
      ? { port: config.EG_PORT }
      : { path: config.EG_PORT }
  );
  console.info(`Server started on: ${config.EG_PORT}`);
};
