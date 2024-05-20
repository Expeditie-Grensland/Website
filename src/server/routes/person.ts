import { FastifyPluginAsync } from "fastify";
import { getPerson } from "../db/person.js";

const personRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    const { personId } = request.params as { personId: string };
    const person = await getPerson(personId);

    if (!person) return reply.callNotFound();

    reply.locals.person = person;
  });

  app.get("/", async (request, reply) => reply.view("public/person"));
};

export default personRoutes;
