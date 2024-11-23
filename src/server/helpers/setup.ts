import fastifyFlash from "@fastify/flash";
import fastifyFormbody from "@fastify/formbody";
import fastifySecureSession from "@fastify/secure-session";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import fastify, { FastifyInstance } from "fastify";
import { join } from "node:path";
import pug from "pug";
import qs from "qs";
import { getPerson } from "../db/person.js";
import migrator from "../db/schema/migrator.js";
import { getFileType, getFileUrl } from "../files/files.js";
import routes from "../routes/index.js";
import { config } from "./configHelper.js";
import { getHttpMessage } from "./errorCodes.js";

export const migrateDatabase = async () => {
  const { results, error } = await migrator.migrateToLatest();

  if (results?.length) {
    console.info("Applied migrations:");
    console.table(results, ["migrationName", "direction", "status"]);
  }

  if (error) {
    console.error("Error applying database migrations");
    throw error;
  }
};

const setupSession = async (app: FastifyInstance) => {
  await app.register(fastifySecureSession, {
    cookieName: "eg-session",
    key: config.EG_SECRET_KEY,
    expiry: 30 * 24 * 60 * 60,
    cookie: {
      path: "/",
      secure: true,
      httpOnly: true,
    },
  });
  await app.register(fastifyFlash);
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

  app.decorateReply("sendHtml", function (html: string) {
    this.header("Content-Type", "text/html; charset=utf-8");
    this.send(html);
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
        (request.session.userId && (await getPerson(request.session.userId))) ||
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
