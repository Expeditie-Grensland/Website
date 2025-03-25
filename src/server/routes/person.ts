import { FastifyPluginAsync } from "fastify";
import { MemberPage } from "../components/pages/public/member.js";
import { getPerson } from "../db/person.js";

const personRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    const { personId } = request.params as { personId: string };
    const person = await getPerson(personId);

    if (!person) return reply.callNotFound();

    reply.locals.person = person;
  });

  app.get("/", (request, reply) =>
    reply.sendComponent(MemberPage, {
      person: reply.locals.person!,
      user: reply.locals.user,
    })
  );
};

export default personRoutes;
