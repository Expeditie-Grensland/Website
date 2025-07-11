import { Insertable, Updateable } from "kysely";
import { getDb } from "./schema/database.js";
import { Packlist, PacklistItem } from "./schema/types.js";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export const getAllPacklists = () =>
  getDb().selectFrom("packlist").selectAll().orderBy("position").execute();

export const getPacklist = (id: string) =>
  getDb()
    .selectFrom("packlist")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

export const getPacklistItems = (list: string) =>
  getDb()
    .selectFrom("packlist_item")
    .where("packlist_id", "=", list)
    .selectAll()
    .orderBy("position")
    .execute();

export const addPacklist = (packlist: Insertable<Packlist>) =>
  getDb()
    .insertInto("packlist")
    .values(packlist)
    .returningAll()
    .executeTakeFirstOrThrow();

export const updatePacklist = (id: string, packlist: Updateable<Packlist>) =>
  getDb()
    .updateTable("packlist")
    .where("id", "=", id)
    .set(packlist)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deletePacklist = (id: string) =>
  getDb()
    .deleteFrom("packlist")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

export const addPacklistItem = (
  listId: string,
  item: Omit<Insertable<PacklistItem>, "packlist_id">
) =>
  getDb()
    .insertInto("packlist_item")
    .values({ ...item, packlist_id: listId })
    .returningAll()
    .executeTakeFirstOrThrow();

export const updatePacklistItem = (
  listId: string,
  id: number,
  item: Omit<Updateable<PacklistItem>, "packlist_id">
) =>
  getDb()
    .updateTable("packlist_item")
    .where("id", "=", id)
    .where("packlist_id", "=", listId)
    .set(item)
    .returningAll()
    .executeTakeFirstOrThrow();

export const deletePacklistItem = (listId: string, id: number) =>
  getDb()
    .deleteFrom("packlist_item")
    .where("id", "=", id)
    .where("packlist_id", "=", listId)
    .returningAll()
    .executeTakeFirstOrThrow();

export const getPacklistsWithItems = (ids: string[]) =>
  getDb()
    .selectFrom("packlist")
    .selectAll()
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("packlist_item")
          .selectAll()
          .whereRef("packlist_item.packlist_id", "=", "packlist.id")
          .orderBy("packlist_item.position")
      ).as("items"),
    ])
    .where("id", "in", ids)
    .orderBy("packlist.position")
    .execute();
