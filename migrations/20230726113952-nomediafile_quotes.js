import mongo from "mongodb";

export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db
      .collection("quotes")
      .find({ mediaFile: { $exists: true } });

    for await (const doc of cursor) {
      const file = doc.mediaFile;

      const attachmentFile = `${file.id.toString()}.${file.ext}`;

      await db.collection("quotes").updateOne(
        { _id: doc._id },
        {
          $set: { attachmentFile },
          $unset: { mediaFile: true },
        }
      );
    }
  });
};

export const down = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db
      .collection("quotes")
      .find({ attachmentFile: { $exists: true } });

    for await (const doc of cursor) {
      const [name, ext] = doc.attachmentFile.split(".");
      let mime = "";

      switch (ext) {
        case "mp3":
          mime = "audio/mpeg";
          break;

        case "mp4":
          mime = "video/mp4";
          break;

        default:
          throw new Error("Extensie niet herkend");
      }

      const mediaFile = {
        id: new mongo.ObjectId(name),
        ext,
        mime,
        restricted: false,
      };

      await db.collection("quotes").updateOne(
        { _id: doc._id },
        {
          $set: { mediaFile },
          $unset: { attachmentFile: true },
        }
      );
    }
  });
};
