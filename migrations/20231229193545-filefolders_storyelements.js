export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db
      .collection("storyelements")
      .find({ media: { $exists: true } });

    for await (const doc of cursor) {
      const media = doc.media.map((medium) => ({
        ...medium,
        file: medium.file.split("/")[0],
      }));

      await db.collection("storyelements").updateOne(
        { _id: doc._id },
        {
          $set: { media },
        }
      );
    }
  });
};

export const down = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db
      .collection("storyelements")
      .find({ media: { $exists: true } });

    for await (const doc of cursor) {
      const media = doc.media.map((medium) => {
        const file = medium.file.endsWith(".video")
          ? "1080p30.mp4"
          : medium.file.endsWith(".audio")
          ? "audio.mp3"
          : "normaal.jpg";
        return { ...medium, file: `${medium.file}/${file}` };
      });

      await db.collection("storyelements").updateOne(
        { _id: doc._id },
        {
          $set: { media },
        }
      );
    }
  });
};
