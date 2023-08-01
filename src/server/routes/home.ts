import { FastifyPluginAsync } from "fastify";
import { getAllExpedities } from "../components/expedities/index.js";

const homeRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (request, reply) => {
    const expedities = await getAllExpedities();
    return reply.view("public/home", { isHome: true, expedities });
  });
};

export default homeRoutes;
