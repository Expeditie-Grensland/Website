import express from "express";

import { setAuthLocals } from "../helpers/authHelper.js";
import { router as adminRouter } from "./admin.js";
import { router as expeditieRouter } from "./expeditie.js";
import { router as homeRouter } from "./home.js";
import { router as membersRouter } from "./members.js";
import { router as personRouter } from "./person.js";

export function Router(): express.Router {
  const router = express.Router();

  router.use(setAuthLocals);

  router.use("/leden", membersRouter);
  router.use("/admin", adminRouter);

  router.get("/login", (req, res) => res.redirect(301, "/leden/login"));
  router.get("/woordenboek", (req, res) =>
    res.redirect(301, "/leden/woordenboek")
  );
  router.get("/citaten", (req, res) => res.redirect(301, "/leden/citaten"));

  router.use("/", homeRouter);
  router.use("/:expeditie", expeditieRouter);
  router.use("/:person", personRouter);

  return router;
}
