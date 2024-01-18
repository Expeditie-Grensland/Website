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
import qs from "qs";
import redis from "redis";
import { getPersonById } from "../components/people/index.js";
import { getFileType, getFileUrl } from "../files/files.js";
import routes from "../routes/index.js";
import { config } from "./configHelper.js";
import { getHttpMessage } from "./errorCodes.js";

export const setupMongooose = async () => {
  mongoose.set("debug", config.NODE_ENV === "development");
  await mongoose.connect(config.EG_MONGO_URL);
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

    const staticFiles = [
      { path: "/favicon.ico", file: "favicons/favicon.ico" },
      { path: "/browserconfig.xml", file: "favicons/favicon.ico" },
      { path: "/manifest.webmanifest", file: "favicons/manifest.webmanifest" },
      { path: "/worker.js", file: "scripts/worker.js" },
    ];

    for (const { path, file } of staticFiles)
      app.get(path, (_, reply) => reply.sendFile(file));
  }
};

const setupErrors = (app: FastifyInstance) => {
  app.setErrorHandler(async (error, request, reply) => {
    reply.log.error(error);

    return reply.code(error.statusCode || 500).view("public/error", {
      code: error.statusCode || 500,
      message: getHttpMessage(error.statusCode),
      details: error.message,
    });
  });

  app.setNotFoundHandler(async (request, reply) =>
    reply.code(404).view("public/error", {
      code: 404,
      message: getHttpMessage(404),
    })
  );
};

export const setupFastify = async () => {
  const app = fastify({
    logger:
      config.NODE_ENV === "development"
        ? {
            level: "debug",
            transport: {
              target: "pino-pretty",
              options: {
                translateTime: "SYS:HH:MM:ss",
                ignore: "pid,hostname",
              },
            },
          }
        : {
            level: "info",
          },
    trustProxy: config.NODE_ENV === "production",
  });

  await app.register(fastifyView, {
    engine: { pug },
    root: join(global.rootDir, "views"),
    includeViewExtension: true,
  });

  await setupStaticRoutes(app);

  await app.register(fastifyFormbody, { parser: (str) => qs.parse(str) });

  await setupSession(app);

  setupErrors(app);

  app.addHook("onRequest", async (request, reply) => {
    reply.locals = {
      ...reply.locals,
      getFileType,
      getFileUrl,
      user:
        (request.session.userId &&
          (await getPersonById(request.session.userId))) ||
        undefined,
      umami:
        config.EG_UMAMI_SCRIPT_URL && config.EG_UMAMI_WEBSITE_ID
          ? {
              scriptUrl: config.EG_UMAMI_SCRIPT_URL,
              websiteId: config.EG_UMAMI_WEBSITE_ID,
            }
          : undefined,
    };
  });

  await app.register(routes);

  await app.ready();
  await app.listen({
    host: "::",
    port: config.EG_PORT,
  });
};
