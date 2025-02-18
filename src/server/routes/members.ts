import { FastifyPluginAsync } from "fastify";
import { marked } from "marked";
import { renderAfkowobopage } from "../components/pages/members/afkowobo.js";
import { renderDictionaryPage } from "../components/pages/members/dictionary.js";
import { renderMembersHomePage } from "../components/pages/members/home.js";
import { renderLoginPage } from "../components/pages/members/login.js";
import { renderPointsPage } from "../components/pages/members/points.js";
import { renderQuotesPage } from "../components/pages/members/quotes.js";
import { getAllAfkos } from "../db/afko.js";
import { getFullEarnedPoints } from "../db/earned-point.js";
import { getMemberLinks } from "../db/member-link.js";
import {
  authenticatePerson,
  getAllPersonsWithAddresses,
} from "../db/person.js";
import { getAllQuotes } from "../db/quote.js";
import { getAllWords } from "../db/word.js";
import adminRoutes from "./admin.js";
import { getAllExpedities } from "../db/expeditie.js";
import { renderAddresslistPage } from "../components/pages/members/addresslist.js";

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

    return reply.sendHtml(
      renderLoginPage({ messages: reply.flash("error") as string[] })
    );
  });

  app.post("/login", async (request, reply) => {
    try {
      const body = request.body as { username: string; password: string }; // FIXME
      const user = await authenticatePerson(body.username, body.password);
      if (!user) throw new Error("Gebruikersnaam of wachtwoord is incorrect");

      request.session.set("userId", user.id);
    } catch (err) {
      let errorMsg = "Error!";

      if (typeof err === "string") errorMsg = err;
      else if (err instanceof Error) errorMsg = err.message;

      request.flash("error", errorMsg);
    }

    return reply.redirect("/leden/login");
  });

  app.get("/loguit", async (request, reply) => {
    request.session.set("userId", undefined);
    reply.redirect("/");
  });

  app.get("/", async (request, reply) =>
    reply.sendHtml(
      renderMembersHomePage({
        memberLinks: await getMemberLinks(),
        currentExpedities: await getAllExpedities({
          onlyOngoing: true,
        }),
        user: reply.locals.user!,
      })
    )
  );

  marked.use({
    renderer: {
      paragraph({ tokens }) {
        return this.parser.parseInline(tokens);
      },
    },
  });

  app.get("/woordenboek", async (request, reply) =>
    reply.sendHtml(
      renderDictionaryPage({
        words: await getAllWords(),
        user: reply.locals.user!,
      })
    )
  );

  app.get("/citaten", async (request, reply) =>
    reply.sendHtml(
      renderQuotesPage({
        quotes: await getAllQuotes(),
        user: reply.locals.user!,
      })
    )
  );

  app.get("/afkowobo", async (request, reply) =>
    reply.sendHtml(
      renderAfkowobopage({
        afkos: await getAllAfkos(),
        user: reply.locals.user!,
      })
    )
  );

  app.get("/punten", async (request, reply) =>
    reply.sendHtml(
      renderPointsPage({
        points: await getFullEarnedPoints(),
        user: reply.locals.user!,
      })
    )
  );

  app.get("/adressenlijst", async (request, reply) =>
    reply.sendHtml(
      renderAddresslistPage({
        persons: await getAllPersonsWithAddresses(),
        user: reply.locals.user!,
      })
    )
  );
};

export default memberRoutes;
