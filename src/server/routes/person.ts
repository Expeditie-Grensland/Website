import { FastifyPluginAsync } from "fastify";
import { getPersonByUserName } from "../components/people/index.js";

const personRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    const { personId } = request.params as { personId: string };
    const person = await getPersonByUserName(personId);

    if (!person) return reply.callNotFound();
    
    reply.locals.person = person;
  });

  app.get("/", async (request, reply) => reply.view("public/person"));
};

export default personRoutes;
