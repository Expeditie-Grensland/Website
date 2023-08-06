export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const cursor = await db.collection("people").find();

    for await (const doc of cursor) {
      const firstName = doc.firstName;
      const lastNameParts = doc.lastName.split(" ");
      const lastName = [lastNameParts.pop(), ...lastNameParts].join(" ");

      await db
        .collection("people")
        .updateOne(
          { _id: doc._id },
          { $set: { sortingName: `${lastName}, ${firstName}` } }
        );
    }
  });
};

export const down = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    await db
      .collection("people")
      .updateMany({}, { $unset: { sortingName: true } });
  });
};
