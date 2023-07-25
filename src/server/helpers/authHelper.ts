import { Request, Response, NextFunction } from "express";

import { PersonDocument } from "../components/people/model.js";

export const setAuthLocals = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.user = req.user;
  }
  next();
};

export const loginRedirect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isAuthenticated()) {
    if (req.session && req.method == "GET")
      req.session.returnTo = req.originalUrl;

    res.redirect("/leden/login");
  } else next();
};

export const noAdminRedirect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(req.user as PersonDocument).isAdmin) {
    res.redirect("/leden");
  } else next();
};
