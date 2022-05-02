import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ContentImage from "~/components/public/ContentImage";
import db from "~/utils/database/db";
import getFileUrl from "~/utils/fileStorage/getFileUrl";
import Hls from "hls.js";
import { useEffect, useRef } from "react";
import { Prisma } from "~/generated/db";
import SidebarList from "~/components/public/SidebarList";

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
    },
  });

  if (!expeditie) throw json("Expeditie niet gevonden!", { status: 404 });

  const data: LoaderData = {
    ...expeditie,
    backgroundFile: getFileUrl(expeditie.backgroundFile),
    movieFilePoster: expeditie.showMovie
      ? `${process.env.MEDIAFILE_BASE_URL}/${expeditie.slug}/poster.jpg`
      : undefined,
    movieFileManifest: expeditie.showMovie
      ? `${process.env.MEDIAFILE_BASE_URL}/${expeditie.slug}/index.m3u8`
      : undefined,
    movieFileProgressive: expeditie.showMovie
      ? `${process.env.MEDIAFILE_BASE_URL}/${expeditie.slug}/progressive.mp4`
      : undefined,
  };

  return json<LoaderData>(data);
};

const meta: MetaFunction = ({ data }) => ({
  title: `Expeditie ${data.name}`,
});

const ExpeditiePage = () => {
  const video = useRef<HTMLVideoElement>(null);
  const expeditie = useLoaderData<LoaderData>();

  useEffect(() => {
    if (video.current && Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
      });
      hls.loadSource(expeditie.movieFileManifest!);
      hls.attachMedia(video.current);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) hls.destroy();
      });
    } else if (
      video.current &&
      video.current.canPlayType("application/vnd.apple.mpegurl")
    ) {
      video.current.src = expeditie.movieFileManifest!;
    }
  });

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

      <div className="container mx-auto my-20 flex flex-row flex-wrap-reverse">
        <div className="flex-auto w-1 mb-10">
          {expeditie.showMovie && (
            <video
              className="aspect-video shadow-important"
              controls
              poster={expeditie.movieFilePoster}
              ref={video}
            >
              <source src={expeditie.movieFileProgressive} type="video/mp4" />
              <p>
                Sorry, deze video kan niet door je browser worden afgespeeld.
              </p>
            </video>
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
