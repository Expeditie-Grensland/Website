import type { FastifyPluginAsync } from "fastify";
import expeditieRoutes from "./expeditie.js";
import homeRoutes from "./home.js";
import memberRoutes from "./members.js";
import personRoutes from "./person.js";

const routes: FastifyPluginAsync = async (app) => {
  const redirects = [
    { from: "/login", to: "/leden/login" },
    { from: "/woordenboek", to: "/leden/woordenboek" },
    { from: "/citaten", to: "/leden/citaten" },
  ];

  for (const { from, to } of redirects)
    app.get(from, (_, reply) => reply.redirect(to, 301));

  await app.register(memberRoutes, { prefix: "/leden" });

  await app.register(homeRoutes);
  await app.register(personRoutes, { prefix: "/lid/:personId" });
  await app.register(expeditieRoutes, { prefix: "/:expeditieId" });
};

export default routes;
