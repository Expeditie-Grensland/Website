import type { FastifyPluginAsync } from "fastify";
import { AddresslistPage } from "../components/pages/members/addresslist.js";
import { AfkowoboPage } from "../components/pages/members/afkowobo.js";
import { DictionaryPage } from "../components/pages/members/dictionary.js";
import { MembersHomePage } from "../components/pages/members/home.js";
import { LoginPage } from "../components/pages/members/login.js";
import { PacklistPage } from "../components/pages/members/packlist.js";
import { PacklistChoicePage } from "../components/pages/members/packlist-choice.js";
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
import { getAllPacklists, getPacklistsWithItems } from "../db/packlist.js";
import {
  authenticatePerson,
  getAllPersonsWithAddresses,
} from "../db/person.js";
import { getAllQuotes } from "../db/quote.js";
import { getAllWords } from "../db/word.js";
import adminRoutes from "./admin.js";

const memberRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (req, reply) => {
    if (req.url !== "/leden/login" && !reply.locals.user) {
      if (req.method === "GET") req.session.set("returnTo", req.url);

      reply.redirect("/leden/login");
    }
  });

  await app.register(adminRoutes, { prefix: "/admin" });

  app.get("/login", async (req, reply) => {
    if (reply.locals.user) {
      if (req.session.returnTo) {
        const returnTo = req.session.returnTo;
        req.session.set("returnTo", undefined);
        return reply.redirect(returnTo);
      }

      return reply.redirect("/leden");
    }

    return reply.sendComponent(LoginPage, {
      messages: reply.flash("error") as string[],
    });
  });

  app.post<{ Body: { username: string; password: string } }>(
    // FIXME: validation
    "/login",
    async (req, reply) => {
      try {
        const user = await authenticatePerson(
          req.body.username,
          req.body.password
        );
        if (!user) throw new Error("Gebruikersnaam of wachtwoord is incorrect");

        req.session.set("userId", user.id);
      } catch (err) {
        let errorMsg = "Error!";

        if (typeof err === "string") errorMsg = err;
        else if (err instanceof Error) errorMsg = err.message;

        req.flash("error", errorMsg);
      }

      return reply.redirect("/leden/login");
    }
  );

  app.get("/loguit", async (req, reply) => {
    req.session.set("userId", undefined);
    reply.redirect("/");
  });

  app.get("/", (_req, reply) =>
    reply.sendComponent(MembersHomePage, {
      memberLinks: getMemberLinks(),
      memberWritings: getMemberWritingsList(),
      currentExpedities: getAllExpedities({
        onlyOngoing: true,
      }),
      user: reply.locals.user!,
    })
  );

  app.get("/woordenboek", (_req, reply) =>
    reply.sendComponent(DictionaryPage, {
      words: getAllWords(),
      user: reply.locals.user!,
    })
  );

  app.get("/citaten", (_req, reply) =>
    reply.sendComponent(QuotesPage, {
      quotes: getAllQuotes(),
      user: reply.locals.user!,
    })
  );

  app.get("/afkowobo", (_req, reply) =>
    reply.sendComponent(AfkowoboPage, {
      afkos: getAllAfkos(),
      user: reply.locals.user!,
    })
  );

  app.get("/punten", (_req, reply) =>
    reply.sendComponent(PointsPage, {
      points: getFullEarnedPoints(),
      user: reply.locals.user!,
    })
  );

  app.get("/adressenlijst", (_req, reply) =>
    reply.sendComponent(AddresslistPage, {
      persons: getAllPersonsWithAddresses(),
      user: reply.locals.user!,
    })
  );

  app.get<{ Querystring: { gen?: "y" } & Record<string, "on"> }>(
    "/paklijst",
    async (req, reply) => {
      if (req.query.gen === "y") {
        const lists = Object.keys(req.query).filter(
          (key) => req.query[key] === "on"
        );

        return await reply.sendComponent(PacklistPage, {
          listsWithItems: getPacklistsWithItems(lists),
          user: reply.locals.user!,
        });
      }

      return await reply.sendComponent(PacklistChoicePage, {
        lists: getAllPacklists(),
        user: reply.locals.user!,
      });
    }
  );

  app.get<{ Params: { id: string } }>(
    "/geschriften/:id",
    async (req, reply) => {
      const writing = await getFullMemberWriting(req.params.id);
      if (!writing) return reply.callNotFound();

      return reply.sendComponent(WritingPage, {
        writing,
        user: reply.locals.user!,
      });
    }
  );
};

export default memberRoutes;
