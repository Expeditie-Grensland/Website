import { Insertable, Updateable } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { getDb } from "./schema/database.js";
import { Story, StoryMedia } from "./schema/types.js";

export const getExpeditieStories = (expeditieId: string) =>
  getDb()
    .selectFrom("story")
    .innerJoin("geo_node", "geo_node.id", "story.node_id")
    .where("expeditie_id", "=", expeditieId)
    .selectAll("story")
    .select((eb) => [
      eb
        .selectFrom("geo_location")
        .select("longitude")
        .whereRef("story.node_id", "=", "geo_location.node_id")
        .orderBy(({ eb, fn, ref }) =>
          fn("abs", [
            eb("story.time_stamp" as "id", "-", ref("geo_location.time_stamp")),
          ])
        )
        .limit(1)
        .as("longitude"),
      eb
        .selectFrom("geo_location")
        .select("latitude")
        .whereRef("story.node_id", "=", "geo_location.node_id")
        .orderBy(({ eb, fn, ref }) =>
          fn("abs", [
            eb("story.time_stamp" as "id", "-", ref("geo_location.time_stamp")),
          ])
        )
        .limit(1)
        .as("latitude"),
      jsonArrayFrom(
        eb
          .selectFrom("story_media")
          .selectAll("story_media")
          .whereRef("story_media.story_id", "=", "story.id")
      ).as("media"),
    ])
    .orderBy("story.time_stamp")
    .execute();

export const getAllStories = () =>
  getDb()
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
  getDb()
    .selectFrom("story_media")
    .innerJoin("story", "story_media.story_id", "story.id")
    .innerJoin("geo_node", "geo_node.id", "story.node_id")
    .innerJoin("expeditie", "geo_node.expeditie_id", "expeditie.id")
    .selectAll("story_media")
    .select("expeditie.name as expeditie_name")
    .execute();

type WithMedia = {
  media: Insertable<Omit<StoryMedia, "story_id">>[];
};

export const addStory = ({ media, ...story }: Insertable<Story> & WithMedia) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
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
  getDb()
    .transaction()
    .execute(async (trx) => {
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
  getDb()
    .deleteFrom("story")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
