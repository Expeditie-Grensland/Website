import { onRequestHookHandler } from "fastify";
import LdapAuth from "ldapauth-fork";
import { getPersonAndUpdatePassword } from "../db/person.js";
import { config } from "./configHelper.js";

export const noAdminRedirect: onRequestHookHandler = (_req, reply) => {
  if (reply.locals.user?.type != "admin") reply.redirect(302, "/leden");
};

const ldap = new LdapAuth({
  url: config.EG_LDAP_URL,
  bindDN: config.EG_LDAP_BIND_DN,
  bindCredentials: config.EG_LDAP_BIND_CREDENTIALS,
  searchBase: config.EG_LDAP_SEARCH_BASE,
  searchFilter: config.EG_LDAP_SEARCH_FILTER,
  searchScope: config.EG_LDAP_SEARCH_SCOPE,
  searchAttributes: [config.EG_LDAP_ID_FIELD],
  reconnect: true,
});

const ldapAuthenticate = (username: string, password: string) =>
  new Promise<string>((resolve, reject) => {
    ldap.authenticate(username, password, (err, user) => {
      if (err) return reject(err);
      if (!user || !user[config.EG_LDAP_ID_FIELD])
        return reject(new Error("Gebruiker heeft een onverwacht formaat"));

      return resolve(user[config.EG_LDAP_ID_FIELD]);
    });
  });

export const authenticateUser = async (username: string, password: string) => {
  const id = await ldapAuthenticate(username, password);
  const user = await getPersonAndUpdatePassword(id, password);

  if (!user) throw new Error("Gebruiker bestaat niet in database");

  return user;
};
