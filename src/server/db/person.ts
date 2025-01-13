import { pbkdf2, randomBytes } from "crypto";
import { bcrypt, bcryptVerify } from "hash-wasm";
import { getDb } from "./schema/database.js";
import { Insertable, Updateable } from "kysely";
import { Person } from "./schema/types.js";

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

export const addPerson = (person: Insertable<Person>) =>
  getDb()
    .insertInto("person")
    .values(person)
    .returningAll()
    .executeTakeFirstOrThrow();

export const updatePerson = (id: string, person: Updateable<Person>) =>
  getDb()
    .updateTable("person")
    .where("id", "=", id)
    .set(person)
    .returningAll()
    .executeTakeFirstOrThrow();

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
