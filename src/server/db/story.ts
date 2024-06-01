import { Insertable, Updateable } from "kysely";
import db from "./schema/database.js";
import { Story, StoryMedia } from "./schema/types.js";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export const getStoryCount = (expeditieId: string) =>
  db
    .selectFrom("story")
    .where("expeditie_id", "=", expeditieId)
    .select(({ fn }) => [fn.countAll<bigint>().as("count")])
    .executeTakeFirst()
    .then((result) => result?.count || 0n);

export const getNewestStoryId = (expeditieId: string) =>
  db
    .selectFrom("story")
    .where("expeditie_id", "=", expeditieId)
    .orderBy("id desc")
    .select("id")
    .limit(1)
    .executeTakeFirst()
    .then((result) => result?.id || -1);

export const getStories = (expeditieId: string) =>
  db
    .selectFrom("story")
    .where("expeditie_id", "=", expeditieId)
    .selectAll("story")
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("story_media")
          .selectAll("story_media")
          .whereRef("story_media.story_id", "=", "story.id")
      ).as("media"),
    ])
    .orderBy("time_stamp asc")
    .execute();

export const getAllStories = () =>
  db
    .selectFrom("story")
    .selectAll("story")
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("story_media")
          .selectAll("story_media")
          .whereRef("story_media.story_id", "=", "story.id")
      ).as("media"),
    ])
    .orderBy("time_stamp desc")
    .execute();

export const getAllStoryMedia = () =>
  db
    .selectFrom("story_media")
    .innerJoin("story", "story_media.story_id", "story.id")
    .innerJoin("expeditie", "story.expeditie_id", "expeditie.id")
    .selectAll("story_media")
    .select("expeditie.name as expeditie_name")
    .execute();

type WithMedia = {
  media: Insertable<Omit<StoryMedia, "story_id">>[];
};

export const addStory = ({ media, ...story }: Insertable<Story> & WithMedia) =>
  db.transaction().execute(async (trx) => {
    const result = await trx
      .insertInto("story")
      .values(story)
      .returningAll()
      .executeTakeFirstOrThrow();

    if (media.length > 0) {
      await trx
        .insertInto("story_media")
        .values(media.map((m) => ({ ...m, story_id: result.id })))
        .execute();
    }

    return result;
  });

export const updateStory = (
  id: number,
  { media, ...story }: Updateable<Story> & WithMedia
) =>
  db.transaction().execute(async (trx) => {
    const result = await trx
      .updateTable("story")
      .set(story)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();

    const updateMedia = media.filter(
      (m): m is Omit<(typeof media)[number], "id"> & { id: number } =>
        m.id !== undefined
    );

    await trx
      .deleteFrom("story_media")
      .where("story_id", "=", result.id)
      .$if(updateMedia.length > 0, (qb) =>
        qb.where(
          "id",
          "not in",
          updateMedia.map((m) => m.id)
        )
      )
      .execute();

    for (const updateMedium of updateMedia) {
      await trx
        .updateTable("story_media")
        .where("story_id", "=", id)
        .where("id", "=", updateMedium.id)
        .set(updateMedium)
        .executeTakeFirstOrThrow();
    }

    const addMedia = media.filter((m) => m.id === undefined);

    if (addMedia.length > 0) {
      await trx
        .insertInto("story_media")
        .values(addMedia.map((m) => ({ ...m, story_id: result.id })))
        .execute();
    }

    return result;
  });

export const deleteStory = (id: number) =>
  db
    .deleteFrom("story")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
