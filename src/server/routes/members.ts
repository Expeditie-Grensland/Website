import { marked } from "marked";

import { FastifyPluginAsync } from "fastify";
import { getLuxonDate } from "../components/dateTime/dateHelpers.js";
import { getAllPopulatedPoints } from "../components/earnedPoints/index.js";
import { getAllMemberLinks } from "../components/memberLinks/index.js";
import { getAllQuotes } from "../components/quotes/index.js";
import { getAllWords } from "../components/words/index.js";
import { authenticateUser } from "../helpers/auth.js";
import { getMessages, setMessage } from "../helpers/flash.js";
import adminRoutes from "./admin.js";
import { config } from "../helpers/configHelper.js";

const memberRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    if (request.url !== "/leden/login" && !reply.locals.user) {
      if (request.method === "GET") request.session.returnTo = request.url;

      reply.redirect(302, "/leden/login");
    }
  });

  await app.register(adminRoutes, { prefix: "/admin" });

  app.get("/login", async (request, reply) => {
    if (reply.locals.user) {
      if (request.session.returnTo) {
        reply.redirect(302, request.session.returnTo);
        delete request.session.returnTo;
        return reply;
      }

      return reply.redirect(302, "/leden");
    }

    return reply.view("members/login", {
      isLogin: true,
      messages: getMessages(request.session, "errorMsg"),
    });
  });

  app.post("/login", async (request, reply) => {
    try {
      const body = request.body as { username: string; password: string }; // FIXME

      request.session.userId =
        (await authenticateUser(body.username, body.password))?._id ||
        undefined;
    } catch (e) {
      let errorMsg = "Error!";

      if (typeof e === "string") errorMsg = e;
      else if (e instanceof Error) errorMsg = e.message;

      setMessage(request.session, "errorMsg", errorMsg);
    }

    return reply.redirect(302, "/leden/login");
  });

  app.get("/loguit", async (request, reply) => {
    delete request.session.userId;
    reply.redirect(302, "/");
  });

  app.get("/", async (request, reply) =>
    reply.view("members/index", {
      isHome: true,
      links: [
        {
          title: "Hoofdpagina",
          text: "Alle Expedities (en verborgen videos)",
          href: "/",
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
          adminHref: "/leden/admin/story",
        },
        {
          title: "Bestanden",
          text: "De Small Data",
          adminHref: "/leden/admin/bestanden",
        },
        ...(config.EG_UMAMI_SHARE_URL
          ? [
              {
                title: "Statistieken",
                text: "Wie zijn onze fans?",
                href: config.EG_UMAMI_SHARE_URL,
                target: "_blank",
              },
            ]
          : []),
      ].concat(
        (await getAllMemberLinks()).map((l) => {
          return {
            title: l.title,
            text: l.text || "",
            href: l.href,
            target: "_blank",
          };
        })
      ),
    })
  );

  const renderer = new marked.Renderer();

  const generateSimple = (word: string): string =>
    word
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^0-9a-z]+/gi, "-");

  renderer.link = (href, title, text): string => {
    if (href == "w") {
      href = `#${generateSimple(text)}`;
    } else if (href != null && href.slice(0, 2) == "w:") {
      href = `#${generateSimple(href.slice(2))}`;
    }
    return new marked.Renderer().link(href, title, text);
  };

  renderer.paragraph = (text): string => text;

  marked.use({
    renderer,
  });

  app.get("/woordenboek", async (request, reply) =>
    reply.view("members/dictionary", {
      dictionary: await getAllWords(),
      generateSimple,
      marked: (s: string) => marked(s),
    })
  );

  app.get("/citaten", async (request, reply) =>
    reply.view("members/quotes", {
      quotes: await getAllQuotes(),
      generateSimple,
      marked: (s: string) => marked(s),
    })
  );

  app.get("/punten", async (request, reply) => {
    const earnedPoints = (await getAllPopulatedPoints()).map((ep) => {
      return {
        date: getLuxonDate(ep.dateTime).toLocaleString({
          month: "2-digit",
          day: "2-digit",
        }),
        amount: ep.amount,
        name: `${ep.personId.firstName} ${ep.personId.lastName}`,
        team: ep.personId.team as string,
        expeditie: ep.expeditieId ? `Expeditie ${ep.expeditieId.name}` : "",
      };
    });

    const score = earnedPoints.reduce(
      (acc, cur) =>
        Object.assign(acc, { [cur.team]: (acc[cur.team] || 0) + cur.amount }),
      {} as Record<string, number>
    );

    return reply.view("members/points", { earnedPoints, score });
  });
};

export default memberRoutes;
