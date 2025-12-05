import { readFile } from "node:fs/promises";
import { join } from "node:path";
import fastifyFlash from "@fastify/flash";
import fastifyFormbody from "@fastify/formbody";
import fastifySecureSession from "@fastify/secure-session";
import fastifyStatic from "@fastify/static";
import fastify, { type FastifyError, type FastifyInstance } from "fastify";
import qs from "qs";
import { ErrorPage } from "../components/pages/public/error.js";
import { getPerson } from "../db/person.js";
import { getMigrator } from "../db/schema/migrator.js";
import routes from "../routes/index.js";
import {
  getCryptoConfig,
  getDevSslConfig,
  getNodeEnv,
  getServerConfig,
} from "./config.js";
import { getHttpError } from "./http-errors.js";
import { replyComponent, replyHtml } from "./render.js";

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
      maxAge: 30 * 24 * 60 * 60,
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
    ];

    for (const { path, file } of staticFiles)
      app.get(path, (_, reply) => reply.sendFile(file));
  }
};

const setupErrors = (app: FastifyInstance) => {
  app.setErrorHandler((error: FastifyError, _req, reply) => {
    reply.log.error(error);

    reply.code(error.statusCode || 500).sendComponent(ErrorPage, {
      code: error.statusCode || 500,
      description: getHttpError(error.statusCode),
      details: error.message,
    });
  });

  app.setNotFoundHandler((_req, reply) =>
    reply.code(404).sendComponent(ErrorPage, {
      code: 404,
      description: getHttpError(404),
      user: reply.locals.user,
    })
  );
};

const querystringParser = (str: string) => qs.parse(str, { allowDots: true });

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
    https: getDevSslConfig()
      ? {
          key: await readFile(getDevSslConfig()!.key),
          cert: await readFile(getDevSslConfig()!.cert),
        }
      : null,
    routerOptions: {
      querystringParser,
    },
  });

  app.decorateReply("sendHtml", replyHtml);
  app.decorateReply("sendComponent", replyComponent);

  await setupStaticRoutes(app);

  await app.register(fastifyFormbody, { parser: querystringParser });

  await setupSession(app);

  setupErrors(app);

  app.addHook("onRequest", async (req, reply) => {
    reply.locals = {
      ...reply.locals,
      user:
        (req.session.userId && (await getPerson(req.session.userId))) ||
        undefined,
    };
  });

  await app.register(routes);

  await app.ready();
  await app.listen({
    host: "::",
    port: getServerConfig().port,
  });
};
