import type { Kysely } from "kysely";
import { down as prevDown, up as prevUp } from "./20240602-192149-email.js";

export const up = async (db: Kysely<any>) => {
  await prevDown(db);
};

export const down = async (db: Kysely<any>) => {
  await prevUp(db);
};
