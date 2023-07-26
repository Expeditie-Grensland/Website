import mongo from "mongodb";

export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db.collection("expedities").find();

    for await (const doc of cursor) {
      const bg = doc.backgroundFile;
      const newBg = `${bg.id.toString()}.${bg.ext}`;

      await db
        .collection("expedities")
        .updateOne({ _id: doc._id }, { $set: { backgroundFile: newBg } });
    }
  });
};

export const down = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db.collection("expedities").find();

    for await (const doc of cursor) {
      const [name, ext] = doc.backgroundFile.split(".");

      const newBg = {
        id: new mongo.ObjectId(name),
        ext,
        mime: "image/jpeg",
        restricted: false,
      };

      await db
        .collection("expedities")
        .updateOne({ _id: doc._id }, { $set: { backgroundFile: newBg } });
    }
  });
};
