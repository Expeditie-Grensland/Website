import type { RequestHandler } from "express";
import { config } from "./configHelper.js";

export const getFileUrl = (file: string) =>
  `${config.EG_FILES_BASE_URL}/${file}`;

export const fileUrlMiddleware: RequestHandler = (req, res, next) => {
  res.locals.getFileUrl = getFileUrl;
  next();
};
