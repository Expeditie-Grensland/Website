export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db
      .collection("quotes")
      .find({ attachmentFile: { $exists: true } });

    for await (const doc of cursor)
      await db.collection("quotes").updateOne(
        { _id: doc._id },
        {
          $set: { attachmentFile: doc.attachmentFile.split("/")[0] },
        }
      );
  });
};

export const down = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db
      .collection("quotes")
      .find({ attachmentFile: { $exists: true } });

    for await (const doc of cursor) {
      const file = doc.attachmentFile.endsWith(".video")
        ? "1080p30.mp4"
        : doc.attachmentFile.endsWith(".audio")
        ? "audio.mp3"
        : "normaal.jpg";

      await db.collection("quotes").updateOne(
        { _id: doc._id },
        {
          $set: { attachmentFile: `${doc.attachmentFile}/${file}` },
        }
      );
    }
  });
};
