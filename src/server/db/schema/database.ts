import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { config } from "../../helpers/configHelper.js";
import { DB } from "./types.js";

pg.types.setTypeParser(pg.types.builtins.INT8, BigInt);

let db: Kysely<DB>;

export const getDb = () => {
  if (!db) {
    db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: new pg.Pool({
          connectionString: config.EG_DB_URL,
        }),
      }),
      log: config.NODE_ENV === "development" ? ["query", "error"] : [],
    });
  }

  return db;
};
