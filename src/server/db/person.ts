import { pbkdf2, randomBytes } from "crypto";
import { bcrypt, bcryptVerify } from "hash-wasm";
import db from "./schema/database.js";

const hashPassword = async (password: string) =>
  await bcrypt({
    password,
    salt: randomBytes(16),
    costFactor: 12,
  });

const checkPassword = async (password: string, hash: string) =>
  await bcryptVerify({ password, hash });

export const getAllPersons = () =>
  db.selectFrom("person").selectAll().execute();

export const getPerson = (id: string) =>
  db.selectFrom("person").where("id", "=", id).selectAll().executeTakeFirst();

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
  const user = await getPerson(id);
  if (!user || !user.password) return null;

  const pbkdf2Check = await checkPbkdf2Password(password, user.password);

  if (pbkdf2Check) {
    return await db
      .updateTable("person")
      .set({ password: await hashPassword(password) })
      .where("id", "=", user.id)
      .returningAll()
      .executeTakeFirst();
  }

  if (pbkdf2Check === false) return null;
  return (await checkPassword(password, user.password)) ? user : null;
};
