import Hls from "hls.js";
import { useEffect, useRef } from "react";

type Props = {
  progressiveFile: string;
  manifestFile: string;
  posterFile: string;
};

const ExpeditieMovie = ({
  progressiveFile,
  manifestFile,
  posterFile,
}: Props) => {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!video.current) return;

    if (video.current.canPlayType("application/vnd.apple.mpegurl")) {
      video.current.src = manifestFile;
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
      });
      hls.loadSource(manifestFile);
      hls.attachMedia(video.current);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) hls.destroy();
      });
    }
  }, [video, manifestFile]);

  return (
    <video
      className="aspect-video shadow-important"
      controls
      poster={posterFile}
      ref={video}
      preload="none"
    >
      <source src={progressiveFile} type="video/mp4" />
      <p>Sorry, deze video kan niet door je browser worden afgespeeld.</p>
    </video>
  );
};

export default ExpeditieMovie;
