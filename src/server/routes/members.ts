import { FastifyPluginAsync } from "fastify";
import { AddresslistPage } from "../components/pages/members/addresslist.js";
import { AfkowoboPage } from "../components/pages/members/afkowobo.js";
import { DictionaryPage } from "../components/pages/members/dictionary.js";
import { MembersHomePage } from "../components/pages/members/home.js";
import { LoginPage } from "../components/pages/members/login.js";
import { PointsPage } from "../components/pages/members/points.js";
import { QuotesPage } from "../components/pages/members/quotes.js";
import { WritingPage } from "../components/pages/members/writing.js";
import { getAllAfkos } from "../db/afko.js";
import { getFullEarnedPoints } from "../db/earned-point.js";
import { getAllExpedities } from "../db/expeditie.js";
import { getMemberLinks } from "../db/member-link.js";
import {
  getFullMemberWriting,
  getMemberWritingsList,
} from "../db/member-writings.js";
import {
  authenticatePerson,
  getAllPersonsWithAddresses,
} from "../db/person.js";
import { getAllQuotes } from "../db/quote.js";
import { getAllWords } from "../db/word.js";
import adminRoutes from "./admin.js";

const memberRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    if (request.url !== "/leden/login" && !reply.locals.user) {
      if (request.method === "GET")
        request.session.set("returnTo", request.url);

      reply.redirect("/leden/login");
    }
  });

  await app.register(adminRoutes, { prefix: "/admin" });

  app.get("/login", async (request, reply) => {
    if (reply.locals.user) {
      if (request.session.returnTo) {
        const returnTo = request.session.returnTo;
        request.session.set("returnTo", undefined);
        return reply.redirect(returnTo);
      }

      return reply.redirect("/leden");
    }

    return reply.sendComponent(LoginPage, {
      messages: reply.flash("error") as string[],
    });
  });

  app.post<{ Body: { username: string; password: string } }>( // FIXME: validation
    "/login",
    async (request, reply) => {
      try {
        const user = await authenticatePerson(
          request.body.username,
          request.body.password
        );
        if (!user) throw new Error("Gebruikersnaam of wachtwoord is incorrect");

        request.session.set("userId", user.id);
      } catch (err) {
        let errorMsg = "Error!";

        if (typeof err === "string") errorMsg = err;
        else if (err instanceof Error) errorMsg = err.message;

        request.flash("error", errorMsg);
      }

      return reply.redirect("/leden/login");
    }
  );

  app.get("/loguit", async (request, reply) => {
    request.session.set("userId", undefined);
    reply.redirect("/");
  });

  app.get("/", (request, reply) =>
    reply.sendComponent(MembersHomePage, {
      memberLinks: getMemberLinks(),
      memberWritings: getMemberWritingsList(),
      currentExpedities: getAllExpedities({
        onlyOngoing: true,
      }),
      user: reply.locals.user!,
    })
  );

  app.get("/woordenboek", (request, reply) =>
    reply.sendComponent(DictionaryPage, {
      words: getAllWords(),
      user: reply.locals.user!,
    })
  );

  app.get("/citaten", (request, reply) =>
    reply.sendComponent(QuotesPage, {
      quotes: getAllQuotes(),
      user: reply.locals.user!,
    })
  );

  app.get("/afkowobo", (request, reply) =>
    reply.sendComponent(AfkowoboPage, {
      afkos: getAllAfkos(),
      user: reply.locals.user!,
    })
  );

  app.get("/punten", (request, reply) =>
    reply.sendComponent(PointsPage, {
      points: getFullEarnedPoints(),
      user: reply.locals.user!,
    })
  );

  app.get("/adressenlijst", (request, reply) =>
    reply.sendComponent(AddresslistPage, {
      persons: getAllPersonsWithAddresses(),
      user: reply.locals.user!,
    })
  );

  app.get<{ Params: { id: string } }>(
    "/geschriften/:id",
    async (request, reply) => {
      const writing = await getFullMemberWriting(request.params.id);
      if (!writing) return reply.callNotFound();

      return reply.sendComponent(WritingPage, {
        writing,
        user: reply.locals.user!,
      });
    }
  );
};

export default memberRoutes;
