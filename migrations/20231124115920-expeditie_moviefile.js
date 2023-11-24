export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db
      .collection("expedities")
      .find({ movieHlsDir: { $exists: true } });

    for await (const doc of cursor)
      await db.collection("expedities").updateOne(
        { _id: doc._id },
        {
          $set: { movieFile: doc.movieHlsDir },
          $unset: { movieHlsDir: true },
        }
      );
  });
};

export const down = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db
      .collection("expedities")
      .find({ movieFile: { $exists: true } });

    for await (const doc of cursor)
      await db.collection("expedities").updateOne(
        { _id: doc._id },
        {
          $set: { movieHlsDir: doc.movieFile },
          $unset: { movieFile: true },
        }
      );
  });
};
