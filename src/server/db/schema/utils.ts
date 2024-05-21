import { Selectable, sql } from "kysely";
import { DB } from "./types.js";

export const jsonAggTable = <T extends keyof DB>(tableName: T) =>
  sql<Selectable<DB[T]>[]>`
    coalesce(
      jsonb_agg(${sql.ref(tableName)})
        FILTER (WHERE ${sql.ref(tableName)} IS NOT NULL),
      '[]'::JSONB
    )`;
