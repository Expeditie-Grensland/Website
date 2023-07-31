import { RequestHandler } from "express";
import LdapAuth from "ldapauth-fork";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  getPersonById,
  getPersonByLdapId,
} from "../components/people/index.js";
import { config } from "./configHelper.js";

export const setAuthLocals: RequestHandler = async (req, res, next) => {
  if (req.session.userId)
    res.locals.user = (await getPersonById(req.session.userId)) || undefined;

  next();
};

export const loginRedirect: RequestHandler = (req, res, next) => {
  if (res.locals.user) next();
  else {
    if (req.session && req.method == "GET")
      req.session.returnTo = req.originalUrl;

    res.redirect("/leden/login");
  }
};

export const noAdminRedirect: RequestHandler = (req, res, next) => {
  if (res.locals.user?.isAdmin) next();
  else res.redirect("/leden");
};

const ldap = new LdapAuth({
  url: config.EG_LDAP_URL,
  bindDN: config.EG_LDAP_BIND_DN,
  bindCredentials: config.EG_LDAP_BIND_CREDENTIALS,
  searchBase: config.EG_LDAP_SEARCH_BASE,
  searchFilter: config.EG_LDAP_SEARCH_FILTER,
  searchScope: config.EG_LDAP_SEARCH_SCOPE,
  searchAttributes: [config.EG_LDAP_ID_FIELD],
});

const ldapAuthenticate = (user: string, pass: string) =>
  new Promise<string>((resolve, reject) => {
    ldap.authenticate(user, pass, (err, user) => {
      if (err) return reject(err);
      if (!user || !user[config.EG_LDAP_ID_FIELD])
        return reject(new Error("Gebruiker heeft een onverwacht formaat"));

      return resolve(user[config.EG_LDAP_ID_FIELD]);
    });
  });

export const login: RequestHandler = async (req, res) => {
  try {
    const ldapId = await ldapAuthenticate(req.body.username, req.body.password);
    const user = await getPersonByLdapId(ldapId);

    if (!user) throw new Error("Gebruiker bestaat niet in database");

    req.session.userId = user._id;
  } catch (e) {
    let errorMsg = "Error!";

    if (typeof e === "string") errorMsg = e;
    else if (e instanceof z.ZodError) errorMsg = fromZodError(e).message;
    else if (e instanceof Error) errorMsg = e.message;

    req.flash("error", errorMsg);
  } finally {
    res.redirect("/leden/login");
  }
};

export const logout: RequestHandler = (req, res) => {
  delete req.session.userId;
  res.redirect("/");
};
