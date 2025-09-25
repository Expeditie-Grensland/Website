import type { Kysely } from "kysely";

const colors = [
  "#2962ff",
  "#d50000",
  "#008c3a",
  "#ff6d00",
  "#c51162",
  "#aa00ff",
  "#aeea00",
  "#00bfa5",
  "#00b8d4",
];

export const up = async (db: Kysely<any>) => {
  await db.schema.alterTable("geo_node").addColumn("color", "text").execute();

  const nodes = await db
    .selectFrom("geo_node")
    .orderBy("expeditie_id")
    .orderBy("id")
    .select(["id", "expeditie_id"])
    .execute();

  const nodeGroups = Object.values(
    Object.groupBy(nodes, (node) => node.expeditie_id)
  ).filter((group) => group !== undefined);

  for (const group of nodeGroups) {
    await Promise.all(
      group.map(({ id }, idx) =>
        db
          .updateTable("geo_node")
          .set({ color: colors[idx % colors.length] })
          .where("id", "=", id)
          .execute()
      )
    );
  }

  await db.schema
    .alterTable("geo_node")
    .alterColumn("color", (col) => col.setNotNull())
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.alterTable("geo_node").dropColumn("color").execute();
};
