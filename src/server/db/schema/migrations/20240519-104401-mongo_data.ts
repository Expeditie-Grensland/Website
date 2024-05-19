/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from "kysely";
import { config } from "../../../helpers/configHelper";

export const up = async (db: Kysely<any>) => {
  if (!config.EG_MONGO_URL) return;

  const { MongoClient } = await import("mongodb");
  const mongo = new MongoClient(config.EG_MONGO_URL);
  await mongo.connect();
  const mdb = mongo.db();

  const expeditieIds = new Map<string, string>();
  const personIds = new Map<string, string>();

  console.info("Migrating people");

  for await (const person of mdb.collection("people").find()) {
    personIds.set(person._id.toHexString(), person.userName);

    await db
      .insertInto("person")
      .values({
        id: person.userName,
        first_name: person.firstName,
        last_name: person.lastName,
        sorting_name: person.sortingName,
        initials: person.initials,
        ldap_id: person.ldapId,
        type: person.isAdmin ? "admin" : person.type,
        team:
          person.team === "Rood" ? "r" : person.team == "Blauw" ? "b" : null,
      })
      .execute();
  }

  console.info("Migrating expedities");

  for await (const expeditie of mdb.collection("expedities").find()) {
    expeditieIds.set(expeditie._id.toHexString(), expeditie.nameShort);

    await db
      .insertInto("expeditie")
      .values({
        id: expeditie.nameShort,
        name: expeditie.name,
        subtitle: expeditie.subtitle,
        sequence_number: expeditie.sequenceNumber * 10,
        finished: expeditie.finished,
        show_map: expeditie.showMap,
        countries: expeditie.countries,
        background_file: expeditie.backgroundFile,
        movie_file: expeditie.movieFile,
        movie_restricted: expeditie.movieRestricted,
      })
      .execute();

    for (const personId of expeditie.personIds || []) {
      await db
        .insertInto("expeditie_person")
        .values({
          expeditie_id: expeditie.nameShort,
          person_id: personIds.get(personId.toHexString()),
        })
        .execute();
    }

    for (const personId of expeditie.movieEditorIds || []) {
      await db
        .insertInto("expeditie_movie_editor")
        .values({
          expeditie_id: expeditie.nameShort,
          person_id: personIds.get(personId.toHexString()),
        })
        .execute();
    }
  }

  console.info("Migrating words");

  for await (const word of mdb.collection("words").find()) {
    await db
      .insertInto("word")
      .values({
        word: word.word,
        definitions: word.definitions,
        phonetic: word.phonetic,
        attachment_file: word.attachmentFile,
      })
      .execute();
  }

  console.info("Migrating quotes");

  for await (const quote of mdb.collection("quotes").find()) {
    await db
      .insertInto("quote")
      .values({
        quote: quote.quote,
        quotee: quote.quotee,
        context: quote.context,
        time_stamp: quote.dateTime.stamp,
        time_zone: quote.dateTime.zone,
        attachment_file: quote.attachmentFile,
      })
      .execute();
  }

  console.info("Migrating afkos");

  for await (const afko of mdb.collection("afkos").find()) {
    await db
      .insertInto("afko")
      .values({
        afko: afko.afko,
        definitions: afko.definitions,
        attachment_file: afko.attachment_file,
      })
      .execute();
  }

  console.info("Migrating points");

  for await (const point of mdb.collection("earnedpoints").find()) {
    await db
      .insertInto("earned_point")
      .values({
        expeditie_id: expeditieIds.get(point.expeditieId?.toHexString()),
        person_id: personIds.get(point.personId.toHexString()),
        amount: point.amount,
        time_stamp: point.dateTime.stamp,
        time_zone: point.dateTime.zone,
      })
      .execute();
  }

  console.info("Migrating nodes");

  for await (const node of mdb.collection("geonodes").find()) {
    const result = await db
      .insertInto("geo_node")
      .values({
        expeditie_id: expeditieIds.get(node.expeditieId.toHexString()),
        time_from: node.timeFrom,
        time_till: node.timeTill == Infinity ? 2147483647 : node.timeTill,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    for (const personId of node.personIds) {
      await db
        .insertInto("geo_node_person")
        .values({
          geo_node_id: result.id,
          person_id: personIds.get(personId.toHexString()),
        })
        .execute();
    }
  }

  console.info("Migrating locations");

  const locationCount = await mdb.collection("geolocations").countDocuments();
  let i = 0;
  for await (const location of mdb.collection("geolocations").find()) {
    if (++i % 10000 == 0)
      console.info(`${i}/${locationCount} locations migrated`);

    await db
      .insertInto("geo_location")
      .values({
        expeditie_id: expeditieIds.get(location.expeditieId.toHexString()),
        person_id: personIds.get(location.personId.toHexString()),
        time_stamp: location.dateTime.stamp,
        time_zone: location.dateTime.zone,
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude,
      })
      .execute();
  }

  await mongo.close();
};

export const down = async (db: Kysely<any>) => {
  await db.deleteFrom("expeditie").execute();
  await db.deleteFrom("person").execute();
  await db.deleteFrom("expeditie_person").execute();
  await db.deleteFrom("expeditie_movie_editor").execute();
  await db.deleteFrom("word").execute();
  await db.deleteFrom("quote").execute();
  await db.deleteFrom("afko").execute();
  await db.deleteFrom("earned_point").execute();
  await db.deleteFrom("geo_node").execute();
  await db.deleteFrom("geo_node_person").execute();
  await db.deleteFrom("geo_location").execute();
};
