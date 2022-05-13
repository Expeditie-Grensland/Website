import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import WordOrQuote from "~/components/members/WordOrQuote";
import { Prisma } from "~/generated/db";
import {
  getUserFromRequest,
  requireUser,
} from "~/utils/authentication/sessionUser";
import db from "~/utils/database/db";
import getFileUrl from "~/utils/fileStorage/getFileUrl";

const handle = {
  backLink: () => ({
    to: "/leden",
    text: "← Leden",
  }),
};

type LoaderData = {
  items: {
    word: string;
    definitions: string[];
    phonetic?: string;
    attachment?: {
      type: "video" | "audio";
      mime: string;
      url: string;
    };
  }[];
};

const loader: LoaderFunction = async ({ request }) => {
  requireUser(await getUserFromRequest(request));

  const items = (
    await db.word.findMany({
      orderBy: {
        word: Prisma.SortOrder.asc,
      },
      include: {
        attachment: true,
      },
    })
  ).map(({ word, definitions, phonetic, attachment }) => ({
    word,
    definitions,
    phonetic: phonetic || undefined,
    attachment: attachment
      ? {
          type: attachment.mime.startsWith("video/")
            ? ("video" as "video")
            : ("audio" as "audio"),
          mime: attachment.mime,
          url: getFileUrl(attachment),
        }
      : undefined,
  }));

  return json<LoaderData>({
    items,
  });
};

const DictionaryPage = () => {
  const { items } = useLoaderData<LoaderData>();

  return (
    <div className="container mx-auto mb-20">
      <h1 className="text-4xl">Het Grote Woordenboek der Expediets</h1>

      {items.map(({ word, definitions, phonetic, attachment }) => (
        <WordOrQuote
          key={word}
          {...{
            title: word,
            titleExtra: phonetic && `[${phonetic}]`,
            content: definitions,
            attachment,
          }}
        />
      ))}
    </div>
  );
};

export { handle, loader };
export default DictionaryPage;
