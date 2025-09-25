import Hls from "hls.js";

export const setupHls = () => {
  if (!Hls.isSupported()) return;

  const videos = document.querySelectorAll<HTMLVideoElement>("video[data-hls]");

  videos.forEach((video) => {
    const hls = new Hls({
      capLevelToPlayerSize: true,
    });

    hls.loadSource(video.dataset.hls!);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        hls.destroy();
      }
    });
  });
};
