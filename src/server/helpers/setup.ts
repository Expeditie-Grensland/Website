import fastifyFlash from "@fastify/flash";
import fastifyFormbody from "@fastify/formbody";
import fastifySecureSession from "@fastify/secure-session";
import fastifyStatic from "@fastify/static";
import fastify, { FastifyInstance } from "fastify";
import { join } from "node:path";
import qs from "qs";
import { renderErrorPage } from "../components/pages/public/error.js";
import { getPerson } from "../db/person.js";
import { getMigrator } from "../db/schema/migrator.js";
import { getFileType, getFileUrl } from "../files/files.js";
import routes from "../routes/index.js";
import {
  getCryptoConfig,
  getNodeEnv,
  getServerConfig,
  getUmamiConfig,
} from "./config.js";
import { getHttpError } from "./http-errors.js";

export const migrateDatabase = async () => {
  const { results, error } = await getMigrator().migrateToLatest();

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
    key: getCryptoConfig().secretKey,
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
  if (getNodeEnv() === "development") {
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

    reply.code(error.statusCode || 500).sendHtml(
      renderErrorPage({
        code: error.statusCode || 500,
        description: getHttpError(error.statusCode),
        details: error.message,
      })
    );
  });

  app.setNotFoundHandler(async (request, reply) =>
    reply.code(404).sendHtml(
      renderErrorPage({
        code: 404,
        description: getHttpError(404),
        user: reply.locals.user,
      })
    )
  );
};

export const setupFastify = async () => {
  const app = fastify({
    logger:
      getNodeEnv() === "development"
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
    trustProxy: getNodeEnv() === "production",
    querystringParser: (str) => qs.parse(str),
  });

  app.decorateReply("sendHtml", function (html: string) {
    this.header("Content-Type", "text/html; charset=utf-8");
    this.send(`<!DOCTYPE html>${html}`);
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
      umami: getUmamiConfig() || undefined,
    };
  });

  await app.register(routes);

  await app.ready();
  await app.listen({
    host: "::",
    port: getServerConfig().port,
  });
};
