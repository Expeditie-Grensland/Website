import { type Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createView("email_account")
    .as(
      db
        .selectFrom("person")
        .select(["id as username", "password"])
        .where("password", "<>", "")
    )
    .execute();

  await db.schema
    .createView("email_alias")
    .as(
      db
        .selectFrom("person")
        .select([
          sql`person.id || '@expeditiegrensland.nl'`.as("alias"),
          "person.email as destination",
        ])
        .where("person.email", "<>", "")
        .unionAll(
          db
            .selectFrom("expeditie")
            .innerJoin(
              "expeditie_person",
              "expeditie.id",
              "expeditie_person.expeditie_id"
            )
            .innerJoin("person", "expeditie_person.person_id", "person.id")
            .select([
              sql`'expeditie-' || expeditie.id || '@expeditiegrensland.nl'`.as(
                "alias"
              ),
              "person.email as destination",
            ])
            .where("person.email", "<>", "")
        )
        .unionAll(
          db
            .selectFrom("person")
            .select([
              sql`'leden@expeditiegrensland.nl'`.as("alias"),
              "person.email as destination",
            ])
            .where("person.email", "<>", "")
            .where("person.type", "<>", "guest")
        )
        .unionAll(
          db
            .selectFrom("person")
            .select([
              sql`'admin@expeditiegrensland.nl'`.as("alias"),
              "person.email as destination",
            ])
            .where("person.email", "<>", "")
            .where("person.type", "=", "admin")
        )
    )
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.dropView("email_account").execute();
  await db.schema.dropView("email_alias").execute();
};
