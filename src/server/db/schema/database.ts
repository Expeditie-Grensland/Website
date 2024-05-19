import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { config } from "../../helpers/configHelper.js";
import { DB } from "./types.js";

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: config.EG_DB_URL,
    }),
  }),
});

export default db;
