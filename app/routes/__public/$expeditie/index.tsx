import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ContentImage from "~/components/public/ContentImage";
import ExpeditieMovie from "~/components/public/expeditie/ExpeditieMovie";
import SidebarList from "~/components/public/expeditie/SidebarList";
import { Prisma } from "~/generated/db";
import db from "~/utils/database/db";
import getFileUrl from "~/utils/fileStorage/getFileUrl";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";

const handle = {
  backLink: () => ({
    to: "/",
    text: "← Home",
  }),
};

type LoaderData = {
  name: string;
  season: string;
  slug: string;
  showMovie: boolean;
  backgroundFile: string;
  people: {
    firstName: string;
    lastName: string;
  }[];
  movieEditors: {
    firstName: string;
    lastName: string;
  }[];
  movieFilePoster?: string;
  movieFileManifest?: string;
  movieFileProgressive?: string;
  countries: string[];
};

const loader: LoaderFunction = async ({ params }) => {
  const expeditie = await db.expeditie.findUnique({
    where: {
      slug: params.expeditie,
    },
    select: {
      name: true,
      season: true,
      slug: true,
      showMovie: true,
      backgroundFile: true,
      people: {
        select: {
          firstName: true,
          lastName: true,
        },
        orderBy: [
          {
            lastName: Prisma.SortOrder.asc,
          },
          {
            firstName: Prisma.SortOrder.asc,
          },
        ],
      },
      movieEditors: {
        select: {
          firstName: true,
          lastName: true,
        },
        orderBy: [
          {
            type: Prisma.SortOrder.asc,
          },
          {
            lastName: Prisma.SortOrder.asc,
          },
          {
            firstName: Prisma.SortOrder.asc,
          },
        ],
      },
      countries: true,
    },
  });

  if (!expeditie) throw json("Expeditie niet gevonden!", { status: 404 });

  // TODO: These files are not handled very nicely.
  const _makeUrl = (filename: string) =>
    expeditie.showMovie
      ? `${process.env.MEDIAFILE_BASE_URL}/${expeditie.slug}/${filename}`
      : undefined;

  const data: LoaderData = {
    ...expeditie,
    backgroundFile: getFileUrl(expeditie.backgroundFile),
    movieFilePoster: _makeUrl("poster.jpg"),
    movieFileManifest: _makeUrl("index.m3u8"),
    movieFileProgressive: _makeUrl("progressive.mp4"),
  };

  return json<LoaderData>(data);
};

const meta: MetaFunction = ({ data }) => ({
  title: `Expeditie ${data.name}`,
});

const ExpeditiePage = () => {
  const expeditie = useLoaderData<LoaderData>();

  return (
    <>
      <div className="container mx-auto mb-5">
        <ContentImage
          size="big"
          title={expeditie.name}
          subtitle={expeditie.season}
          src={expeditie.backgroundFile}
        />
      </div>

      <div className="container mx-auto my-20 flex flex-row flex-wrap-reverse">
        <div className="flex-auto w-1 mb-10">
          {expeditie.showMovie && (
            <ExpeditieMovie
              progressiveFile={expeditie.movieFileProgressive!}
              manifestFile={expeditie.movieFileManifest!}
              posterFile={expeditie.movieFilePoster!}
            />
          )}
        </div>

        <div className="flex-none w-full lg:w-72 pl-4 mb-10 text-center lg:text-right space-y-5">
          <SidebarList
            title={["Filmmonteur", "Filmmonteurs"]}
            items={expeditie.movieEditors.map(
              ({ firstName, lastName }) => `${firstName} ${lastName}`
            )}
          />

          <SidebarList
            title="Deelnemers"
            items={expeditie.people.map(
              ({ firstName, lastName }) => `${firstName} ${lastName}`
            )}
          />
        </div>
      </div>
    </>
  );
};

export { handle, meta, loader };
export default ExpeditiePage;
