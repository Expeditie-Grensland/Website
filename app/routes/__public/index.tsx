import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import db from "~/utils/db.server";
import { getFileUrl } from "~/utils/mediaFile.server";

const loader: LoaderFunction = () =>
  db.expeditie
    .findMany({
      select: {
        name: true,
        slug: true,
        season: true,
        backgroundFile: true,
      },
    })
    .then((data) =>
      data.map((item) => ({
        ...item,
        backgroundFile: getFileUrl(item.backgroundFile),
      }))
    )
    .then(json);

const HomePage = () => {
  const data = useLoaderData();

  return (
    <div className="bg-slate-700">
      {data.map((expeditie: any) => (
        <div key={expeditie.slug}>
          <Link prefetch="intent" to={`/${expeditie.slug}`}>
            {expeditie.name}
          </Link>
          <span>{expeditie.backgroundFile}</span>
        </div>
      ))}
    </div>
  );
};

export { loader };
export default HomePage;
