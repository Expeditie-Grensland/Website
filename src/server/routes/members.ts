import express from "express";
import { marked } from "marked";

import { getLuxonDate } from "../components/dateTime/dateHelpers.js";
import { getAllPopulatedPoints } from "../components/earnedPoints/index.js";
import { getAllMemberLinks } from "../components/memberLinks/index.js";
import { getAllQuotes } from "../components/quotes/index.js";
import { getAllWords } from "../components/words/index.js";
import { login, loginRedirect, logout } from "../helpers/auth.js";

export const router = express.Router();

router.get(
  "/login",
  (req, res, next) => {
    if (res.locals.user) {
      if (req.session && req.session.returnTo) {
        res.redirect(req.session.returnTo);
        delete req.session.returnTo;
        return;
      }

      res.redirect("/leden");
    } else {
      next();
    }
  },
  (req, res) => {
    res.render("members/login", {
      isLogin: true,
      messages: req.flash("error"),
    });
  }
);

router.post("/login", login);
router.get("/loguit", logout);

router.use(loginRedirect);

router.get("/", async (req, res) =>
  res.render("members/index", {
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
        adminHref: "/admin/woordenboek",
      },
      {
        title: "Citaten",
        text: "De Lange Citatenlijst der Expeditie Grensland",
        href: "/leden/citaten",
        adminHref: "/admin/citaten",
      },
      {
        title: "De Punt'n",
        text: "Welk team is het vurigst? Blauw, of Rood?",
        href: "/leden/punten",
        adminHref: "/admin/punten",
      },
      {
        title: "GPX Upload",
        text: "Omdat we nog steeds geen app hebben",
        adminHref: "/admin/gpx",
      },
      {
        title: "Verhaalelementen",
        text: "Extra informatie op de kaart",
        adminHref: "/admin/story",
      },
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
  mangle: false,
  headerIds: false,
});

router.get("/woordenboek", async (req, res) => {
  res.render("members/dictionary", {
    dictionary: await getAllWords(),
    generateSimple,
    marked: (s: string) => marked(s),
  });
});

router.get("/citaten", async (req, res) => {
  res.render("members/quotes", {
    quotes: await getAllQuotes(),
    generateSimple,
    marked: (s: string) => marked(s),
  });
});

router.get("/punten", async (req, res) => {
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

  res.render("members/points", { earnedPoints, score });
});
