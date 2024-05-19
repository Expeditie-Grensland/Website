import { getAllExpedities } from "../components/expedities/index.js";
import { getAllStories } from "../components/storyElements/index.js";
import { MediaStoryElement } from "../components/storyElements/model.js";
import { getAllAfkos } from "../db/afko.js";
import { getAllQuotes } from "../db/quote.js";
import { getAllWords } from "../db/word.js";
import { getFileType } from "./files.js";

export type FileUseType =
  | "expeditie/background"
  | "expeditie/movie"
  | "word/attachment"
  | "quote/attachment"
  | "afko/attachment"
  | "story/media";

export type FileUse = { type: FileUseType; name: string };

type FileUses = Record<string, FileUse[]>;

const getFileUses = async (): Promise<FileUses> => {
  const uses: FileUses = {};

  const addUseIfFile = (
    type: FileUseType,
    name: string,
    file: string | null | undefined
  ) => {
    if (!file) return;

    if (uses[file]) uses[file].push({ type, name });
    else uses[file] = [{ type, name }];
  };

  const expedities = getAllExpedities();
  const words = getAllWords();
  const quotes = getAllQuotes();
  const afkos = getAllAfkos();
  const stories = getAllStories();

  for (const exp of await expedities) {
    addUseIfFile("expeditie/background", exp.name, exp.backgroundFile);
    addUseIfFile("expeditie/movie", exp.name, exp.movieFile);
  }

  for (const word of await words)
    addUseIfFile("word/attachment", word.word, word.attachment_file);

  for (const quote of await quotes)
    addUseIfFile("quote/attachment", quote.quote, quote.attachment_file);

  for (const afko of await afkos)
    addUseIfFile("afko/attachment", afko.afko, afko.attachment_file);

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

export const getUsesForFiles = async (files: string[]) => {
  const uses = await getFileUses();

  return files.map(
    (file): FileWithUses => ({
      file,
      type: getFileType(file),
      uses: uses[file] || null,
    })
  );
};
