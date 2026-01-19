import type { FastifyPluginAsync } from "fastify";
import { CastReceiverPage } from "../components/pages/public/cast-receiver.js";
import { HomePage } from "../components/pages/public/home.js";
import { getAllExpedities } from "../db/expeditie.js";

const homeRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { concepten?: "1" } }>("/", (req, reply) =>
    reply.sendComponent(HomePage, {
      expedities: getAllExpedities({
        withoutDrafts: !req.query.concepten,
      }),
      user: reply.locals.user,
    })
  );

  app.get("/cast-ontvanger", (_req, reply) =>
    reply.sendComponent(CastReceiverPage, {})
  );
};

export default homeRoutes;
