export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db.collection("people").find();

    for await (const doc of cursor)
      await db
        .collection("people")
        .updateOne(
          { _id: doc._id },
          { $set: { type: doc.firstName === "Jonathan" ? "guest" : "member" } }
        );
  });
};

export const down = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    await db.collection("people").updateMany({}, { $unset: { type: true } });
  });
};
