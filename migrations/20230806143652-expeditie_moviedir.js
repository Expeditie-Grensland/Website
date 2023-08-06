export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db.collection("expedities").find({ showMovie: true });

    for await (const doc of cursor)
      await db
        .collection("expedities")
        .updateOne({ _id: doc._id }, { $set: { movieHlsDir: doc.nameShort } });

    await db
      .collection("expedities")
      .updateMany({}, { $unset: { showMovie: true } });
  });
};

export const down = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    await db
      .collection("expedities")
      .updateMany({}, { $set: { showMovie: false } });

    await db
      .collection("expedities")
      .updateMany(
        { movieHlsDir: { $exists: true } },
        { $unset: { movieHlsDir: true }, $set: { showMovie: true } }
      );
  });
};
