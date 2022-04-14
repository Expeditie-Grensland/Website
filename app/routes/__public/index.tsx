import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ContentImage from "~/components/public/ContentImage";
import db from "~/utils/database/db";
import getFileUrl from "~/utils/fileStorage/getFileUrl";
import { Prisma } from "~/generated/db/index";

const loader: LoaderFunction = async () => {
  const expedities = await db.expeditie.findMany({
    select: {
      name: true,
      season: true,
      slug: true,
      backgroundFile: true,
    },
    orderBy: {
      sequenceNumber: Prisma.SortOrder.desc,
    },
  });

  const data = expedities.map((expeditie) => ({
    ...expeditie,
    backgroundFile: getFileUrl(expeditie.backgroundFile),
  }));

  return json(data);
};

const HomePage = () => {
  const expedities = useLoaderData();

  return (
    <>
      <div className="container mx-auto my-5">
        <ContentImage
          size="big"
          linkTo={expedities[0].slug}
          title={expedities[0].name}
          subtitle={expedities[0].season}
          src={expedities[0].backgroundFile}
        />
      </div>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {expedities.slice(1).map((expeditie: any) => (
            <ContentImage
              key={expeditie.slug}
              size="small"
              linkTo={expeditie.slug}
              title={expeditie.name}
              subtitle={expeditie.season}
              src={expeditie.backgroundFile}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export { loader };
export default HomePage;
