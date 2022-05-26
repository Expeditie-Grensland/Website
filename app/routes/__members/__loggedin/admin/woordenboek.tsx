import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AdminWordEntry from "~/components/admin/AdminWordEntry";
import { Prisma } from "~/generated/db";
import {
  getUserFromRequest,
  requireUser,
} from "~/utils/authentication/sessionUser";
import db from "~/utils/database/db";
import {
  getFormStr,
  getFormStrArr,
  getReqFormInt,
  getReqFormStr,
} from "~/utils/forms/readFormData";
import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from "@remix-run/node";
import type { Word } from "~/generated/db";

const handle = {
  backLink: () => ({
    to: "/leden",
    text: "← Leden",
  }),
};

const meta: MetaFunction = () => ({
  title: `Woordenboek Admin - Expeditie Grensland`,
});

type LoaderData = {
  words: Word[];
};

const loader: LoaderFunction = async ({ request }) => {
  requireUser(await getUserFromRequest(request), true);

  const words = await db.word.findMany({
    orderBy: { word: Prisma.SortOrder.asc },
  });

  return json<LoaderData>({ words });
};

const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const type = getReqFormStr(formData, "type");
  const word = getReqFormStr(formData, "word");
  const phonetic = getFormStr(formData, "phonetic");
  const definitions = getFormStrArr(formData, "definition");

  if (type === "create") {
    await db.word.create({
      data: {
        word,
        phonetic,
        definitions,
      },
    });

    return null;
  }

  const id = getReqFormInt(formData, "id");

  if (type === "update") {
    await db.word.update({
      where: {
        id,
      },
      data: {
        word,
        phonetic,
        definitions,
      },
    });

    return null;
  }

  if (type === "delete") {
    await db.word.delete({ where: { id } });

    return null;
  }
};

const DictionaryAdminPage = () => {
  const { words } = useLoaderData<LoaderData>();

  return (
    <div className="container mx-auto mb-20">
      <h1 className="text-4xl mb-10">Admin: Woordenboek</h1>

      <AdminWordEntry />

      {words.map((word) => (
        <AdminWordEntry key={word.id} item={word} />
      ))}
    </div>
  );
};

export { handle, meta, loader, action };
export default DictionaryAdminPage;
