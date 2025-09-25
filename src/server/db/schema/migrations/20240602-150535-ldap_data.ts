import { type Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema.alterTable("person").addColumn("email", "text").execute();

  if (!process.env.EG_LDAP_URL) return;

  // @ts-expect-error No LDAPjs included
  const ldapjs = (await import("ldapjs")).default;
  const ldapClient = ldapjs.createClient({
    url: process.env.EG_LDAP_URL,
    bindDN: process.env.EG_LDAP_BIND_DN,
    bindCredentials: process.env.EG_LDAP_BIND_CREDENTIALS,
    reconnect: true,
  });

  const ldapUsers = await new Promise<Record<string, Record<string, string[]>>>(
    (resolve, reject) => {
      ldapClient.search(
        process.env.EG_LDAP_SEARCH_BASE,
        {
          scope: process.env.EG_LDAP_SEARCH_SCOPE,
        },
        (err: any, res: any) => {
          if (err) return reject(err);
          res.on("error", (err: any) => reject(err));

          const users: Record<string, Record<string, string[]>> = {};

          res.on("searchEntry", (user: any) => {
            const attrs = Object.fromEntries(
              user.pojo.attributes.map(({ type, values }: any) => [
                type,
                values,
              ])
            );

            if (attrs.uid) users[attrs.uid[0]] = attrs;
          });
          res.on("end", () => resolve(users));
        }
      );
    }
  );

  await Promise.all(
    Object.entries(ldapUsers).map(async ([id, user]) => {
      const email = user.mailForwardingAddress
        ? user.mailForwardingAddress[0]
        : user.mail
          ? user.mail[0]
          : null;

      const password = user.userPassword?.[0] || null;

      return await db
        .updateTable("person")
        .set({ email, password: db.fn.coalesce("password", sql`${password}`) })
        .where("id", "=", id)
        .execute();
    })
  );

  ldapClient.destroy();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.alterTable("person").dropColumn("email").execute();
  await db
    .updateTable("person")
    .set({ password: null })
    .where("password", "like", "{PBKDF2%")
    .execute();
};
