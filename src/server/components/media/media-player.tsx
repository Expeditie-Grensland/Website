import { FunctionComponent } from "preact";
import { getFileType, getFileUrl } from "../../files/files.js";

export const MediaPlayer: FunctionComponent<{ file: string }> = ({ file }) => {
  switch (getFileType(file)) {
    case "audio":
      return (
        <audio class="mw-100" controls preload="none">
          <source src={getFileUrl(file, "audio.mp3")} type="audio/mpeg" />
        </audio>
      );

    case "video":
      return (
        <video
          class="mw-100"
          controls
          preload="none"
          poster={getFileUrl(file, "poster.jpg")}
        >
          <source src={getFileUrl(file, "1080p30.mp4")} type="video/mp4" />
        </video>
      );

    case "afbeelding":
      return <img src={getFileUrl(file, "normaal.jpg")} />;

    default:
      return <span>Niet ondersteund bestandstype</span>;
  }
};
