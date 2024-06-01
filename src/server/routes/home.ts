import { FastifyPluginAsync } from "fastify";
import { getAllExpedities } from "../db/expeditie.js";

const homeRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (request, reply) =>
    reply.view("public/home", {
      isHome: true,
      expedities: await getAllExpedities({
        noDrafts: !Object.hasOwn(request.query as object, "concepten"),
      }),
    })
  );
};

export default homeRoutes;
