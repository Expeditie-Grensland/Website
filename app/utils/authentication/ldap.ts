import { createClient } from "ldapjs";
import type { Client } from "ldapjs";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LDAP_URL: string;
      LDAP_DN: string;
      LDAP_FILTER: string;
      LDAP_IDFIELD: string;
    }
  }
}

let ldap: Client;

declare global {
  var __ldap: Client | undefined;
}

if (!global.__ldap) {
  ldap = createClient({
    url: process.env.LDAP_URL,
  });

  ldap.on("error", (error) => console.error(error));

  if (process.env.NODE_ENV === "development") global.__ldap = ldap;
} else ldap = global.__ldap;

export default ldap;
