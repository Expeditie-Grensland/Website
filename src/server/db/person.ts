import { pbkdf2, randomBytes } from "crypto";
import { bcrypt, bcryptVerify } from "hash-wasm";
import { Insertable, Updateable } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { allValues, EnumTextMap } from "./enums.js";
import { getDb } from "./schema/database.js";
import {
  Person,
  PersonAddress,
  PersonTeam,
  PersonType,
} from "./schema/types.js";

const hashPassword = async (password: string) =>
  await bcrypt({
    password,
    salt: randomBytes(16),
    costFactor: 12,
  });

const checkPassword = async (password: string, hash: string) =>
  await bcryptVerify({ password, hash });

export const getAllPersons = (membersOnly = false) =>
  getDb()
    .selectFrom("person")
    .selectAll()
    .$if(membersOnly, (qb) => qb.where("type", "in", ["admin", "member"]))
    .orderBy("sorting_name")
    .execute();

export const getPerson = (id: string) =>
  getDb()
    .selectFrom("person")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

export const getAllPersonsWithAddresses = (membersOnly = false) =>
  getDb()
    .selectFrom("person")
    .selectAll()
    .$if(membersOnly, (qb) => qb.where("type", "in", ["admin", "member"]))
    .orderBy("sorting_name")
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("person_address")
          .selectAll("person_address")
          .whereRef("person_address.person_id", "=", "person.id")
          .orderBy("name", "asc")
          .orderBy("id", "asc")
      ).as("addresses"),
    ])
    .execute();

type WithAddresses = {
  addresses: Insertable<Omit<PersonAddress, "person_id">>[];
};

export const addPerson = ({
  addresses,
  ...person
}: Insertable<Person> & WithAddresses) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      const result = await trx
        .insertInto("person")
        .values(person)
        .returningAll()
        .executeTakeFirstOrThrow();

      if (addresses.length > 0) {
        await trx
          .insertInto("person_address")
          .values(addresses.map((a) => ({ ...a, person_id: result.id })))
          .execute();
      }

      return result;
    });

export const updatePerson = (
  id: string,
  { addresses, ...person }: Updateable<Person> & WithAddresses
) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      const result = await trx
        .updateTable("person")
        .where("id", "=", id)
        .set(person)
        .returningAll()
        .executeTakeFirstOrThrow();

      const updateAddresses = addresses.filter(
        (a): a is typeof a & { id: number } => a.id !== undefined
      );

      await trx
        .deleteFrom("person_address")
        .where("person_id", "=", result.id)
        .$if(updateAddresses.length > 0, (qb) =>
          qb.where(
            "id",
            "not in",
            updateAddresses.map((a) => a.id)
          )
        )
        .execute();

      for (const address of updateAddresses) {
        await trx
          .updateTable("person_address")
          .where("person_id", "=", id)
          .where("id", "=", address.id)
          .set(address)
          .executeTakeFirstOrThrow();
      }

      const addAddresses = addresses.filter((a) => a.id == undefined);

      if (addAddresses.length > 0) {
        await trx
          .insertInto("person_address")
          .values(addAddresses.map((a) => ({ ...a, person_id: result.id })))
          .execute();
      }

      return result;
    });

export const deletePerson = (id: string) =>
  getDb()
    .deleteFrom("person")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

const pbkdf2HashRegex =
  /^\{PBKDF2-(?<digest>.*)\}(?<iterations>\d+)\$(?<salt>.+)\$(?<key>.+)$/;

const checkPbkdf2Password = (password: string, hash: string) =>
  new Promise<boolean | null>((resolve, reject) => {
    const params = pbkdf2HashRegex.exec(hash)?.groups;
    if (!params) return resolve(null);

    const digest = params.digest.toLowerCase();
    const iterations = parseInt(params.iterations);
    const salt = Buffer.from(params.salt, "base64");
    const key = Buffer.from(params.key, "base64");

    pbkdf2(password, salt, iterations, key.length, digest, (err, calcKey) => {
      if (err) return reject(err);

      resolve(key.equals(calcKey));
    });
  });

export const authenticatePerson = async (id: string, password: string) => {
  const user = await getPerson(id.trim().toLowerCase());
  if (!user || !user.password) return null;

  const pbkdf2Check = await checkPbkdf2Password(password, user.password);

  if (pbkdf2Check) {
    return await getDb()
      .updateTable("person")
      .set({ password: await hashPassword(password) })
      .where("id", "=", user.id)
      .returningAll()
      .executeTakeFirst();
  }

  if (pbkdf2Check === false) return null;
  return (await checkPassword(password, user.password)) ? user : null;
};

export const personTeamTexts = {
  blue: "Blauw",
  red: "Rood",
  green: "Groen",
  [allValues]: ["blue", "red", "green"],
} as const satisfies EnumTextMap<PersonTeam>;

export const personTypeTexts = {
  admin: "Admin",
  member: "Lid",
  former: "Voormalig lid",
  guest: "Gast",
  [allValues]: ["admin", "member", "former", "guest"],
} as const satisfies EnumTextMap<PersonType>;
