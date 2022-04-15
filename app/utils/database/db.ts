import { PrismaClient } from "~/generated/db";

let db: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

if (!global.__db) {
  db = new PrismaClient();
  db.$connect();

  if (process.env.NODE_ENV === "development") global.__db = db;
} else db = global.__db;

export default db;
