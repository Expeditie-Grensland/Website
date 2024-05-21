import db from "./schema/database.js";
import { jsonAggTable } from "./schema/utils.js";

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
    .leftJoin("story_media", "story.id", "story_id")
    .selectAll("story")
    .select(() => [jsonAggTable("story_media", "story_media.file").as("media")])
    .groupBy("story.id")
    .orderBy("time_stamp asc")
    .execute();

export const getAllStoryMedia = () =>
  db
    .selectFrom("story_media")
    .innerJoin("story", "story_media.story_id", "story.id")
    .innerJoin("expeditie", "story.expeditie_id", "expeditie.id")
    .selectAll("story_media")
    .select("expeditie.name as expeditie_name")
    .execute();
