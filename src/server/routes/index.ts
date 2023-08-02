import { FastifyPluginAsync } from "fastify";
import homeRoutes from "./home.js";
import personRoutes from "./person.js";
import expeditieRoutes from "./expeditie.js";
import memberRoutes from "./members.js";
import { getHttpMessage } from "../helpers/errorCodes.js";

const routes: FastifyPluginAsync = async (app) => {
  const redirects = [
    { from: "/login", to: "/leden/login" },
    { from: "/woordenboek", to: "/leden/woordenboek" },
    { from: "/citaten", to: "/leden/citaten" },
  ];

  for (const { from, to } of redirects)
    app.get(from, (_, reply) => reply.redirect(301, to));

  await app.register(memberRoutes, { prefix: "/leden" });

  await app.register(homeRoutes);
  await app.register(personRoutes, { prefix: "/lid/:personId" });
  await app.register(expeditieRoutes, { prefix: "/:expeditieId" });

  app.get("/error", (request, reply) => {
    const code = parseInt((request.query as { code?: string }).code || "") || 0;

    return reply.view("public/error", { code, message: getHttpMessage(code) });
  });
};

export default routes;
