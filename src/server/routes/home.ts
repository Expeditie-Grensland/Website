import { FastifyPluginAsync } from "fastify";
import { renderHomePage } from "../components/pages/public/home.js";
import { getAllExpedities } from "../db/expeditie.js";

const homeRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { concepten?: "1" } }>("/", async (request, reply) =>
    reply.sendHtml(
      renderHomePage({
        expedities: await getAllExpedities({
          withoutDrafts: !request.query.concepten,
        }),
        user: reply.locals.user,
      })
    )
  );
};

export default homeRoutes;
