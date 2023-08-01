import { FastifyPluginAsync } from "fastify";
import homeRoutes from "./home.js";
import personRoutes from "./person.js";
import expeditieRoutes from "./expeditie.js";
import memberRoutes from "./members.js";

const routes: FastifyPluginAsync = async (app) => {
  app.get("/login", (_, reply) => reply.redirect(301, "/leden/login"));
  app.get("/woordenboek", (_, reply) =>
    reply.redirect(301, "/leden/woordenboek")
  );
  app.get("/citaten", (_, reply) => reply.redirect(301, "/leden/citaten"));

  await app.register(memberRoutes, { prefix: "/leden" });

  await app.register(homeRoutes);
  await app.register(personRoutes, { prefix: "/lid/:personId" });
  await app.register(expeditieRoutes, { prefix: "/:expeditieId" });
};

export default routes;
