import type { FunctionComponent } from "preact";
import { getFileType, getFileUrl } from "../../files/files.js";

export const MediaPlayer: FunctionComponent<{ file: string }> = ({ file }) => {
  switch (getFileType(file)) {
    case "audio":
      return (
        <audio class="media-player" controls preload="none">
          <source src={getFileUrl(file, "audio.mp3")} type="audio/mpeg" />
        </audio>
      );

    case "video":
      return (
        <video
          class="media-player"
          controls
          preload="none"
          poster={getFileUrl(file, "poster.jpg")}
        >
          <source src={getFileUrl(file, "1080p30.mp4")} type="video/mp4" />
        </video>
      );

    case "afbeelding":
      return (
        <img
          class="media-player"
          src={getFileUrl(file, "normaal.jpg")}
          alt=""
        />
      );

    default:
      return <div class="media-player">Niet ondersteund bestandstype</div>;
  }
};
