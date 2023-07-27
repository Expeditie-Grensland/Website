import type { RequestHandler } from "express";
import { config } from "./configHelper.js";

export const getFileUrl = (file: string) => `${config.files.baseUrl}/${file}`;

export const fileUrlMiddleware: RequestHandler = (req, res, next) => {
  res.locals.getFileUrl = getFileUrl;
  next();
};
