import { join } from "node:path";
import { runProcess } from "../../helpers/process.js";
import { Converter } from "../convert.js";

const convert = async (inputFile: string, outputDir: string) =>
  runProcess("ffmpeg", [
    ["-hide_banner", "-loglevel", "info", "-nostdin"],
    ["-i", inputFile],
    [
      ["-preset", "slow"],
      ["-map", "0:a:0"],
      ["-map_metadata", "-1"],
      ["-c:a", "copy"],
      join(outputDir, "origineel.wav"),
    ],
    [
      ["-preset", "slow"],
      ["-map", "0:a:0"],
      ["-map_metadata", "-1"],
      ["-c:a", "libmp3lame"],
      ["-q:a", "4"],
      join(outputDir, "audio.mp3"),
    ],
  ]);

export const convertAudio: Converter = {
  extension: "audio",
  convert,
};
