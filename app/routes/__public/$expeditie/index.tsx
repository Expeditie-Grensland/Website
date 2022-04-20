import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ContentImage from "~/components/public/ContentImage";
import db from "~/utils/database/db";
import getFileUrl from "~/utils/fileStorage/getFileUrl";

const handle = {
  backLink: () => ({
    to: "/",
    text: "← Home"
  })
}

const loader: LoaderFunction = async ({ params }) => {
  const expeditie = await db.expeditie.findUnique({
    where: {
      slug: params.expeditie,
    },
    select: {
      name: true,
      season: true,
      slug: true,
      backgroundFile: true,
    }
  });

  if (!expeditie) throw json("Expeditie niet gevonden!", { status: 404 });

  const data = {
    ...expeditie,
    backgroundFile: getFileUrl(expeditie.backgroundFile),
  }

  return json(data);
};

const meta: MetaFunction = ({data}) => ({
  title: `Expeditie ${data.name}`
});

const ExpeditiePage = () => {
  const expeditie = useLoaderData();

  return (
    <>
      <div className="container mx-auto my-5">
        <ContentImage
          size="big"
          title={expeditie.name}
          subtitle={expeditie.season}
          src={expeditie.backgroundFile}
        />
      </div>
    </>
  );
};

export { handle, meta, loader };
export default ExpeditiePage;
