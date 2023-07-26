import express from "express";

import { getPersonByUserName } from "../components/people/index.js";

export const router = express.Router({ mergeParams: true });

router.use(async (req, res, next) => {
  const person = await getPersonByUserName(req.params.person);

  if (person != null) {
    res.locals.person = person;
    next();
  } else {
    next("router");
  }
});

router.get("/", async (req, res) => {
  res.render("public/person");
});
