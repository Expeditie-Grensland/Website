import type { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("person")
    .addColumn("password", "text")
    .dropColumn("ldap_id")
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("person")
    .dropColumn("password")
    .addColumn("ldap_id", "text")
    .execute();

  await db
    .updateTable("person")
    .set((eb) => ({
      ldap_id: eb.ref("id"),
    }))
    .execute();
};
