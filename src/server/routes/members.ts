import { FastifyPluginAsync } from "fastify";
import { marked } from "marked";
import packageJson from "../../../package.json" with { type: "json" };
import { getAllAfkos } from "../db/afko.js";
import { getFullEarnedPoints } from "../db/earned-point.js";
import { getMemberLinks } from "../db/member-link.js";
import { authenticatePerson } from "../db/person.js";
import { getAllQuotes } from "../db/quote.js";
import { getAllWords } from "../db/word.js";
import { getUmamiConfig } from "../helpers/config.js";
import { getDateTime } from "../helpers/time.js";
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

    return reply.view("members/login", {
      isLogin: true,
      messages: reply.flash("error"),
    });
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
    reply.view("members/index", {
      isHome: true,
      version: packageJson.version,
      links: [
        {
          title: "Hoofdpagina",
          text: "Alle Expedities (en verborgen videos)",
          href: "/",
          adminHref: "/?concepten",
        },
        {
          title: "Woordenboek",
          text: "Het Grote Woordenboek der Expediets",
          href: "/leden/woordenboek",
          adminHref: "/leden/admin/woordenboek",
        },
        {
          title: "Citaten",
          text: "De Lange Citatenlijst der Expeditie Grensland",
          href: "/leden/citaten",
          adminHref: "/leden/admin/citaten",
        },
        {
          title: "Afkowobo",
          text: "Het enige echte afkortingenwoordenboek der Expediets",
          href: "/leden/afkowobo",
          adminHref: "/leden/admin/afkowobo",
        },
        {
          title: "De Punt'n",
          text: "Welk team is het vurigst? Blauw, of Rood?",
          href: "/leden/punten",
          adminHref: "/leden/admin/punten",
        },
        {
          title: "GPX Upload",
          text: "Omdat we nog steeds geen app hebben",
          adminHref: "/leden/admin/gpx",
        },
        {
          title: "Verhaalelementen",
          text: "Extra informatie op de kaart",
          adminHref: "/leden/admin/verhalen",
        },
        {
          title: "Bestanden",
          text: "De Small Data",
          adminHref: "/leden/admin/bestanden",
        },
        ...(getUmamiConfig()?.shareUrl
          ? [
              {
                title: "Statistieken",
                text: "Wie zijn onze fans?",
                href: getUmamiConfig()!.shareUrl!,
                target: "_blank",
              },
            ]
          : []),
      ].concat(
        (await getMemberLinks()).map((l) => {
          return {
            title: l.title,
            text: l.description,
            href: l.url,
            target: "_blank",
          };
        })
      ),
    })
  );

  marked.use({
    renderer: {
      paragraph({ tokens }) {
        return this.parser.parseInline(tokens);
      },
    },
  });

  app.get("/woordenboek", async (request, reply) =>
    reply.view("members/dictionary", {
      dictionary: await getAllWords(),
      marked: (s: string) => marked(s),
    })
  );

  app.get("/citaten", async (request, reply) =>
    reply.view("members/quotes", {
      quotes: await getAllQuotes(),
      marked: (s: string) => marked(s),
    })
  );

  app.get("/afkowobo", async (request, reply) =>
    reply.view("members/afkowobo", {
      afkos: await getAllAfkos(),
      marked: (s: string) => marked(s),
    })
  );

  app.get("/punten", async (request, reply) => {
    const earnedPoints = (await getFullEarnedPoints()).map((ep) => ({
      date: getDateTime(ep.time_stamp, ep.time_zone).toLocaleString({
        month: "2-digit",
        day: "2-digit",
      }),
      amount: ep.amount,
      name: `${ep.person_first_name} ${ep.person_last_name}`,
      team: ep.team == "b" ? "Blauw" : "Rood",
      expeditie: ep.expeditie_name ? `Expeditie ${ep.expeditie_name}` : "",
    }));

    const score = earnedPoints.reduce(
      (acc, cur) =>
        Object.assign(acc, { [cur.team]: (acc[cur.team] || 0) + cur.amount }),
      {} as Record<string, number>
    );

    return reply.view("members/points", { earnedPoints, score });
  });
};

export default memberRoutes;
