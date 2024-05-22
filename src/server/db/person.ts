import db from "./schema/database.js";

export const getAllPersons = () =>
  db.selectFrom("person").selectAll().execute();

export const getPerson = (id: string) =>
  db
    .selectFrom("person")
    .where("id", "=", id)
    .selectAll()
    .limit(1)
    .executeTakeFirst();

export const getPersonByLdapId = (ldapId: string) =>
  db
    .selectFrom("person")
    .where("ldap_id", "=", ldapId)
    .selectAll()
    .limit(1)
    .executeTakeFirst();
