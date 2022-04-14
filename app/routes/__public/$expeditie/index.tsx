import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import ContentImage from "~/components/public/ContentImage";
import db from "~/utils/db.server";
import { getFileUrl } from "~/utils/mediaFile.server";

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

const ExpeditiePage = () => {
  const expeditie = useLoaderData();

  return (
    <>
      <Link to="/" prefetch="intent">Home</Link><br />
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

export { loader };
export default ExpeditiePage;
