import express from "express";

import { getAllExpedities } from "../components/expedities/index.js";

export const router = express.Router();

router.get("/", (req, res) => {
  getAllExpedities().then((expedities) => {
    res.render("public/home", {
      isHome: true,
      expedities,
    });
  });
});
