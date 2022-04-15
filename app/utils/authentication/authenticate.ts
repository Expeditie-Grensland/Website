import db from "../database/db";
import ldap from "./ldap";

const sanitise = (input: string) =>
  input
    .replace(/\*/g, "\\2a")
    .replace(/\(/g, "\\28")
    .replace(/\)/g, "\\29")
    .replace(/\\/g, "\\5c")
    .replace(/\0/g, "\\00")
    .replace(/\//g, "\\2f");

const ldapAuthenticate = (
  username: string,
  password: string
): Promise<string | null> =>
  new Promise((resolve) => {
    const dn = process.env.LDAP_DN.replace("{{username}}", sanitise(username));

    ldap.bind(dn, password, (err) => {
      if (err) return resolve(null);

      ldap.search(
        dn,
        {
          scope: "base",
          filter: process.env.LDAP_FILTER || "",
        },
        (err, res) => {
          if (err) resolve(null);

          res.on("searchEntry", (entry) => {
            const id = entry.object[process.env.LDAP_IDFIELD || "uid"];
            resolve(typeof id === "string" ? id : id[0]);
          });

          res.on("end", () => {
            resolve(null);
          });
        }
      );
    });
  });

const authenticate = async (username: string, password: string) => {
  const ldapId = await ldapAuthenticate(username, password);

  if (ldapId)
    return await db.person.findUnique({
      where: { ldapId },
    });
  else return null;
};

export default authenticate;
