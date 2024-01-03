import { convertAfbeelding } from "./afbeelding.js";
import { convertAudio } from "./audio.js";
import { convertVideo } from "./video.js";

export const allConverters = {
  afbeelding: convertAfbeelding,
  video: convertVideo,
  audio: convertAudio,
} as const;
