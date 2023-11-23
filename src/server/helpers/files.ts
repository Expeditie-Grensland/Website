import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

import { config } from "./configHelper.js";
import { getAllExpedities } from "../components/expedities/index.js";
import { getAllWords } from "../components/words/index.js";
import { getAllQuotes } from "../components/quotes/index.js";
import { getAllStories } from "../components/storyElements/index.js";
import { MediaStoryElement } from "../components/storyElements/model.js";

export const getFileUrl = (file: string) =>
  `${config.EG_FILES_BASE_URL}/${file}`;

const client = new S3Client({
  endpoint: config.EG_FILES_S3_ENDPOINT,
  region: config.EG_FILES_S3_REGION,
  credentials: {
    accessKeyId: config.EG_FILES_S3_ACCESS_KEY_ID,
    secretAccessKey: config.EG_FILES_S3_ACCESS_SECRET,
  },
});

export const getFileList = async () => {
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: config.EG_FILES_S3_BUCKET,
      Delimiter: "/",
    })
  );

  return [
    ...(response.CommonPrefixes?.reduce(
      (dirs, cp) =>
        cp.Prefix && cp.Prefix.endsWith("/") && cp.Prefix.indexOf(".") > -1
          ? [...dirs, cp.Prefix!.slice(0, -1)]
          : dirs,
      [] as string[]
    ) || []),
    ...(response.Contents || []).reduce(
      (files, item) =>
        item.Key && !item.Key.endsWith("/") && item.Key.indexOf(".") > -1
          ? [...files, item.Key]
          : files,
      [] as string[]
    ),
  ].sort();
};

export const getFileType = (file: string) =>
  file.slice(file.lastIndexOf(".") + 1);

export type FileUseType =
  | "expeditie/background"
  | "expeditie/movie"
  | "word/attachment"
  | "quote/attachment"
  | "story/media";

export type FileUse = { type: FileUseType; name: string };

type FileUses = Record<string, FileUse[]>;

const getFileUses = async (): Promise<FileUses> => {
  const uses: FileUses = {};

  const addUseIfFile = (
    type: FileUseType,
    name: string,
    file: string | undefined
  ) => {
    if (!file) return;

    if (uses[file]) uses[file].push({ type, name });
    else uses[file] = [{ type, name }];
  };

  const expedities = getAllExpedities();
  const words = getAllWords();
  const quotes = getAllQuotes();
  const stories = getAllStories();

  for (const exp of await expedities) {
    addUseIfFile("expeditie/background", exp.name, exp.backgroundFile);
    addUseIfFile("expeditie/movie", exp.name, exp.movieHlsDir);
  }

  for (const word of await words)
    addUseIfFile("word/attachment", word.word, word.attachmentFile);

  for (const quote of await quotes)
    addUseIfFile("quote/attachment", quote.quote, quote.attachmentFile);

  for (const story of await stories) {
    if (story.type !== "media") continue;

    const expeditieName =
      (await expedities).find((exp) => exp._id.equals(story.expeditieId))
        ?.name || "";

    for (const medium of (story as unknown as MediaStoryElement).media || [])
      addUseIfFile("story/media", expeditieName, medium.file);
  }

  return uses;
};

type FileWithUses = {
  file: string;
  type: string;
  uses: FileUse[] | null;
};

export const getFileListWithUses = async (): Promise<FileWithUses[]> => {
  const uses = await getFileUses();

  console.dir(uses);

  return (await getFileList()).map((file) => ({
    file,
    type: getFileType(file),
    uses: uses[file] || null,
  }));
};
