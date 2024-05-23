import { FastifyPluginAsync } from "fastify";
import { marked } from "marked";
import packageJson from "../../../package.json" assert { type: "json" };
import { getAllAfkos } from "../db/afko.js";
import { getFullEarnedPoints } from "../db/earned-point.js";
import { getMemberLinks } from "../db/member-link.js";
import { getAllQuotes } from "../db/quote.js";
import { getAllWords } from "../db/word.js";
import { authenticateUser } from "../helpers/auth.js";
import { config } from "../helpers/configHelper.js";
import { getDateTime } from "../helpers/time.js";
import adminRoutes from "./admin.js";

const memberRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    if (request.url !== "/leden/login" && !reply.locals.user) {
      if (request.method === "GET")
        request.session.set("returnTo", request.url);

      reply.redirect(302, "/leden/login");
    }
  });

  await app.register(adminRoutes, { prefix: "/admin" });

  app.get("/login", async (request, reply) => {
    if (reply.locals.user) {
      if (request.session.returnTo) {
        reply.redirect(302, request.session.returnTo);
        request.session.set("returnTo", undefined);
        return reply;
      }

      return reply.redirect(302, "/leden");
    }

    return reply.view("members/login", {
      isLogin: true,
      messages: reply.flash("error"),
    });
  });

  app.post("/login", async (request, reply) => {
    try {
      const body = request.body as { username: string; password: string }; // FIXME

      request.session.set(
        "userId",
        (await authenticateUser(body.username, body.password))?.id || undefined
      );
    } catch (err) {
      let errorMsg = "Error!";

      if (typeof err === "string") errorMsg = err;
      else if (err instanceof Error) errorMsg = err.message;

      request.flash("error", errorMsg);
    }

    return reply.redirect(302, "/leden/login");
  });

  app.get("/loguit", async (request, reply) => {
    request.session.set("userId", undefined);
    reply.redirect(302, "/");
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

  app.get("/afkowobo", async (request, reply) =>
    reply.view("members/afkowobo", {
      afkos: await getAllAfkos(),
      generateSimple,
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
