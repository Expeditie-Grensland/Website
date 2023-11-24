export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db.collection("expedities").find();

    for await (const doc of cursor)
      await db
        .collection("expedities")
        .updateOne(
          { _id: doc._id },
          {
            $set: {
              backgroundFile: doc.backgroundFile.replace("/normaal.jpg", ""),
            },
          }
        );
  });
};

export const down = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db.collection("expedities").find();

    for await (const doc of cursor)
      await db
        .collection("expedities")
        .updateOne(
          { _id: doc._id },
          { $set: { backgroundFile: doc.backgroundFile + "/normaal.jpg" } }
        );
  });
};
