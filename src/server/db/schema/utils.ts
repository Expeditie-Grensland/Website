import { RawBuilder, Selectable, sql } from "kysely";
import { DB } from "./types.js";

type JsonAggTableOpts = {
  orderBy?: RawBuilder<unknown>;
  filterBy?: string;
};

export const jsonAggTable = <T extends keyof DB>(
  tableName: T,
  filterBy: string,
  { orderBy }: JsonAggTableOpts = {}
) =>
  sql<Selectable<DB[T]>[]>`
    coalesce(
      jsonb_agg(${sql.ref(tableName)} ${orderBy ? sql`ORDER BY ${orderBy}` : sql``})
        FILTER (WHERE ${sql.ref(filterBy)} IS NOT NULL),
      '[]'::JSONB
    )`;
