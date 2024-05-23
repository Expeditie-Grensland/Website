import db from "./schema/database.js";
import { hash } from "bcrypt";

const hashPassword = async (password: string) => hash(password, 12);

export const getAllPersons = () =>
  db.selectFrom("person").selectAll().execute();

export const getPerson = (id: string) =>
  db
    .selectFrom("person")
    .where("id", "=", id)
    .selectAll()
    .limit(1)
    .executeTakeFirst();

export const getPersonAndUpdatePassword = async (
  id: string,
  password: string
) =>
  await db
    .updateTable("person")
    .where("id", "=", id)
    .set({ password: await hashPassword(password) })
    .returningAll()
    .executeTakeFirst();
