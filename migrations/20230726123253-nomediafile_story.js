import mongo from "mongodb";

export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db
      .collection("storyelements")
      .find({ media: { $exists: true } });

    for await (const doc of cursor) {
      const oldMedia = doc.media;

      const media = oldMedia.map((medium) => ({
        description: medium.description,
        file: `${medium.mediaFile.id.toString()}.${medium.mediaFile.ext}`,
      }));

      await db
        .collection("storyelements")
        .updateOne({ _id: doc._id }, { $set: { media } });
    }
  });
};

export const down = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db
      .collection("storyelements")
      .find({ attachmentFile: { $exists: true } });

    for await (const doc of cursor) {
      const oldMedia = doc.media;

      const media = oldMedia.map((medium) => {
        const [name, ext] = medium.split(".");
        let mime = "";

        switch (ext) {
          case "mp3":
            mime = "audio/mpeg";
            break;

          case "mp4":
            mime = "video/mp4";
            break;

          case "jpg":
            mime = "image.jpeg";
            break;

          default:
            throw new Error("Extensie niet herkend");
        }

        return {
          description: medium.description,
          mediaFile: {
            id: new mongo.ObjectId(name),
            ext,
            mime,
            restricted: false,
          },
        };
      });

      await db
        .collection("storyelements")
        .updateOne({ _id: doc._id }, { $set: { media } });
    }
  });
};
