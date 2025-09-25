import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { getDbConfig, getNodeEnv } from "../../helpers/config.js";
import type { DB } from "./types.js";

pg.types.setTypeParser(pg.types.builtins.INT8, BigInt);

let db: Kysely<DB>;

export const getDb = () => {
  if (!db) {
    db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: new pg.Pool({
          connectionString: getDbConfig().url,
        }),
      }),
      log: getNodeEnv() === "development" ? ["query", "error"] : [],
    });
  }

  return db;
};
