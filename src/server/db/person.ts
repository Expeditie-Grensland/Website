import db from "./schema/database.js";
import { compare, hash } from "bcrypt";
import { pbkdf2Sync } from "crypto";

const hashPassword = (password: string) => hash(password, 12);
const checkPassword = (password: string, storedHash: string) =>
  compare(password, storedHash);

export const getAllPersons = () =>
  db.selectFrom("person").selectAll().execute();

export const getPerson = (id: string) =>
  db.selectFrom("person").where("id", "=", id).selectAll().executeTakeFirst();

export const authenticatePerson = async (id: string, password: string) => {
  const user = await getPerson(id);
  if (!user || !user.password) return null;

  const pbkdfParams =
    /^\{PBKDF2-(?<digest>.*)\}(?<iterations>\d+)\$(?<salt>.+)\$(?<key>.+)$/.exec(
      user.password
    )?.groups;

  if (pbkdfParams) {
    const digest = pbkdfParams.digest.toLowerCase();
    const iterations = parseInt(pbkdfParams.iterations);
    const salt = Buffer.from(pbkdfParams.salt, "base64");
    const key = Buffer.from(pbkdfParams.key, "base64");

    const calcKey = pbkdf2Sync(password, salt, iterations, key.length, digest);

    if (!calcKey.equals(key)) return null;

    return await db
      .updateTable("person")
      .set({ password: await hashPassword(password) })
      .where("id", "=", user.id)
      .returningAll()
      .executeTakeFirst();
  }

  if (await checkPassword(password, user.password)) return user;
  else return null;
};
