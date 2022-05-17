import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import WordOrQuote from "~/components/members/WordOrQuote";
import { Prisma } from "~/generated/db";
import {
  getUserFromRequest,
  requireUser,
} from "~/utils/authentication/sessionUser";
import db from "~/utils/database/db";
import getFileUrl from "~/utils/fileStorage/getFileUrl";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";

const handle = {
  backLink: () => ({
    to: "/leden",
    text: "← Leden",
  }),
};

const meta: MetaFunction = () => ({
  title: `Citaten - Expeditie Grensland`,
});

type LoaderData = {
  items: {
    quote: string;
    quotee: string;
    context: string;
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
    await db.quote.findMany({
      orderBy: {
        timestamp: Prisma.SortOrder.asc,
      },
      include: {
        attachment: true,
      },
    })
  ).map(({ quote, quotee, context, attachment }) => ({
    quote,
    quotee,
    context,
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

const QuotesPage = () => {
  const { items } = useLoaderData<LoaderData>();

  return (
    <div className="container mx-auto mb-20">
      <h1 className="text-4xl">
        De Lange Citatenlijst der Expeditie Grensland
      </h1>

      {items.map(({ quote, quotee, context, attachment }) => (
        <WordOrQuote
          key={quote}
          {...{
            title: quote,
            titleExtra: `―\xa0${quotee}`,
            content: context,
            attachment,
          }}
        />
      ))}
    </div>
  );
};

export { handle, meta, loader };
export default QuotesPage;
