import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ContentImage from "~/components/public/ContentImage";
import db from "~/utils/database/db";
import getFileUrl from "~/utils/fileStorage/getFileUrl";
import Hls from "hls.js";
import { useEffect, useRef } from "react";

const handle = {
  backLink: () => ({
    to: "/",
    text: "← Home",
  }),
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
    },
  });

  if (!expeditie) throw json("Expeditie niet gevonden!", { status: 404 });

  const data = {
    ...expeditie,
    backgroundFile: getFileUrl(expeditie.backgroundFile),
    movieFilePoster:
      expeditie.showMovie &&
      `${process.env.MEDIAFILE_BASE_URL}/${expeditie.slug}/poster.jpg`,
    movieFileManifest:
      expeditie.showMovie &&
      `${process.env.MEDIAFILE_BASE_URL}/${expeditie.slug}/index.m3u8`,
    movieFileProgressive:
      expeditie.showMovie &&
      `${process.env.MEDIAFILE_BASE_URL}/${expeditie.slug}/progressive.mp4`,
  };

  return json(data);
};

const meta: MetaFunction = ({ data }) => ({
  title: `Expeditie ${data.name}`,
});

const ExpeditiePage = () => {
  const video = useRef<HTMLVideoElement>(null);
  const expeditie = useLoaderData();

  useEffect(() => {
    if (video.current && Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
      });
      hls.loadSource(expeditie.movieFileManifest);
      hls.attachMedia(video.current);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) hls.destroy();
      });
    } else if (video.current && video.current.canPlayType("application/vnd.apple.mpegurl")) {
      video.current.src = expeditie.movieFileManifest;
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
      <div className="container mx-auto my-20">
        {expeditie.showMovie && (
          <video
            className="aspect-video"
            controls
            poster={expeditie.movieFilePoster}
            ref={video}
          >
            <source src={expeditie.movieFileProgressive} type="video/mp4" />
            <p>Sorry, deze video kan niet door je browser worden afgespeeld.</p>
          </video>
        )}
      </div>
    </>
  );
};

export { handle, meta, loader };
export default ExpeditiePage;
