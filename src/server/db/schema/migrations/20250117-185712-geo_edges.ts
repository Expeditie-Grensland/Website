import type { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .alterTable("geo_node_person")
    .renameColumn("geo_node_id", "node_id")
    .execute();

  await db.schema
    .alterTable("geo_location")
    .addColumn("node_id", "integer", (col) =>
      col.references("geo_node.id").onUpdate("restrict").onDelete("restrict")
    )
    .execute();

  await db.schema
    .createIndex("geo_location_node_id_time_stamp_idx")
    .on("geo_location")
    .columns(["node_id", "time_stamp"])
    .execute();

  await db.schema
    .alterTable("story")
    .addColumn("node_id", "integer", (col) =>
      col.references("geo_node.id").onUpdate("restrict").onDelete("restrict")
    )
    .execute();

  const nodes = (await db
    .selectFrom("geo_node")
    .innerJoin("geo_node_person", "geo_node.id", "geo_node_person.node_id")
    .select((eb) => [
      "id",
      "expeditie_id",
      eb.fn.agg<string[]>("array_agg", ["person_id"]).as("person_ids"),
      "time_from",
      "time_till",
    ])
    .groupBy("id")
    .orderBy("time_from", "asc")
    .orderBy("time_till", "asc")
    .execute()) as Node[];

  for (const node of nodes) {
    await db
      .updateTable("geo_location")
      .set({ node_id: node.id })
      .where("expeditie_id", "=", node.expeditie_id)
      .where("person_id", "in", node.person_ids)
      .where("time_stamp", ">=", node.time_from)
      .where("time_stamp", "<", node.time_till)
      .execute();
  }

  await db
    .updateTable("story")
    .set((eb) => ({
      node_id: eb
        .selectFrom("geo_node")
        .innerJoin("geo_node_person", "geo_node.id", "geo_node_person.node_id")
        .select("id")
        .whereRef("story.expeditie_id", "=", "geo_node.expeditie_id")
        .whereRef("story.person_id", "=", "geo_node_person.person_id")
        .whereRef("story.time_stamp", ">=", "geo_node.time_from")
        .whereRef("story.time_stamp", "<", "geo_node.time_till")
        .limit(1),
    }))
    .execute();

  await db.schema
    .alterTable("geo_location")
    .alterColumn("node_id", (col) => col.setNotNull())
    .dropColumn("expeditie_id")
    .dropColumn("person_id")
    .execute();

  await db.schema
    .alterTable("story")
    .alterColumn("node_id", (col) => col.setNotNull())
    .dropColumn("expeditie_id")
    .dropColumn("person_id")
    .execute();

  await db.schema
    .createTable("geo_node_edge")
    .addColumn("parent_id", "integer", (col) =>
      col
        .notNull()
        .references("geo_node.id")
        .onUpdate("cascade")
        .onDelete("cascade")
    )
    .addColumn("child_id", "integer", (col) =>
      col
        .notNull()
        .references("geo_node.id")
        .onUpdate("cascade")
        .onDelete("cascade")
    )
    .addPrimaryKeyConstraint("geo_node_edge_pkey", ["parent_id", "child_id"])
    .execute();

  const groupedNodes = Object.values(
    Object.groupBy(nodes, (node) => node.expeditie_id)
  ).filter((nodes) => nodes!.length > 1);

  for (const nodesGroup of groupedNodes) {
    await db
      .insertInto("geo_node_edge")
      .values(calculateEdges(nodesGroup!))
      .execute();
  }

  await db.schema
    .alterTable("geo_node")
    .addColumn("description", "text")
    .dropColumn("time_from")
    .dropColumn("time_till")
    .execute();
};

type Node = {
  id: number;
  time_from: number;
  time_till: number;
  expeditie_id: string;
  person_ids: string[];
};

const calculateEdges = (sortedNodes: Node[]) => {
  const prevNodes: {
    node: Node;
    personIds: Set<string>;
  }[] = [];

  const edges: {
    parent_id: number;
    child_id: number;
  }[] = [];

  for (const node of sortedNodes) {
    const personIds = new Set(node.person_ids);

    for (const prevNode of prevNodes) {
      if (personIds.isDisjointFrom(prevNode.personIds)) continue;

      edges.push({ parent_id: prevNode.node.id, child_id: node.id });
      prevNode.personIds = prevNode.personIds.difference(personIds);
    }

    prevNodes.push({ node, personIds });
  }

  return edges;
};

export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable("geo_node_edge").execute();

  await db.schema
    .alterTable("geo_location")
    .addColumn("expeditie_id", "text")
    .addColumn("person_id", "text")
    .execute();

  await db.schema
    .alterTable("story")
    .addColumn("expeditie_id", "text")
    .addColumn("person_id", "text")
    .execute();

  const nodes = await db
    .selectFrom("geo_node")
    .innerJoin("geo_node_person", "geo_node.id", "geo_node_person.node_id")
    .select((eb) => [
      "id",
      "expeditie_id",
      eb.fn.agg<string[]>("array_agg", ["person_id"]).as("person_ids"),
    ])
    .groupBy("id")
    .execute();

  for (const node of nodes) {
    await db
      .updateTable("geo_location")
      .set({ expeditie_id: node.expeditie_id, person_id: node.person_ids[0] })
      .where("node_id", "=", node.id)
      .execute();
  }

  await db
    .updateTable("story")
    .set((eb) => ({
      expeditie_id: eb
        .selectFrom("geo_node")
        .select("expeditie_id")
        .whereRef("geo_node.id", "=", "story.node_id")
        .limit(1),
      person_id: eb
        .selectFrom("geo_node_person")
        .select("person_id")
        .whereRef("geo_node_person.node_id", "=", "story.node_id")
        .limit(1),
    }))
    .execute();

  await db.schema
    .alterTable("geo_node")
    .addColumn("time_from", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("time_till", "integer", (col) =>
      col.notNull().defaultTo(2147483647)
    )
    .dropColumn("description")
    .execute();

  await db
    .updateTable("geo_node")
    .set((eb) => ({
      time_from: eb.fn.agg("least", [
        eb
          .selectFrom("geo_location")
          .select("time_stamp")
          .whereRef("geo_node.id", "=", "geo_location.node_id")
          .orderBy("time_stamp", "asc")
          .limit(1),
        eb
          .selectFrom("story")
          .select("time_stamp")
          .whereRef("geo_node.id", "=", "story.node_id")
          .orderBy("time_stamp", "asc")
          .limit(1),
      ]),

      time_till: eb(
        eb.fn.agg("greatest", [
          eb
            .selectFrom("geo_location")
            .select("time_stamp")
            .whereRef("geo_node.id", "=", "geo_location.node_id")
            .orderBy("time_stamp", "desc")
            .limit(1),
          eb
            .selectFrom("story")
            .select("time_stamp")
            .whereRef("geo_node.id", "=", "story.node_id")
            .orderBy("time_stamp", "desc")
            .limit(1),
        ]),
        "+",
        1
      ),
    }))
    .execute();

  await db.schema
    .alterTable("geo_location")
    .dropColumn("node_id")
    .alterColumn("expeditie_id", (col) => col.setNotNull())
    .alterColumn("person_id", (col) => col.setNotNull())
    .execute();

  await db.schema
    .alterTable("story")
    .dropColumn("node_id")
    .alterColumn("expeditie_id", (col) => col.setNotNull())
    .alterColumn("person_id", (col) => col.setNotNull())
    .execute();

  await db.schema
    .alterTable("geo_node_person")
    .renameColumn("node_id", "geo_node_id")
    .execute();

  await db.schema.dropIndex("geo_location_node_id_time_stamp_idx").execute();
};
