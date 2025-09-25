import { platform } from "node:os";
import { join } from "node:path";
import { runProcess } from "../../helpers/process.js";
import type { Converter } from "../convert.js";

const convert = async (inputFile: string, outputDir: string) =>
  await runProcess("ffmpeg", [
    ["-hide_banner", "-loglevel", "info", "-nostdin"],
    platform() === "win32" && ["-hwaccel", "auto"],
    ["-i", inputFile],
    [
      ["-map_metadata", "-1"],
      ["-movflags", "+faststart"],
      ["-c:v", "copy"],
      ["-bsf:v", "filter_units=remove_types=6"],
      ["-c:a", "copy"],
      join(outputDir, "origineel.mp4"),
    ],
    [
      { width: 1920, height: 1080 },
      { width: 1280, height: 720 },
    ].map(({ width, height }) => [
      ["-map_metadata", "-1"],
      ["-preset", "veryslow"],
      ["-movflags", "+faststart"],
      ["-c:v", "libx264"],
      ["-crf:v", "23"],
      ["-filter:v", `scale='min(iw,${width})':-1,format=yuv420p`],
      ["-r:v", "30"],
      ["-bsf:v", "filter_units=remove_types=6"],
      ["-c:a", "aac"],
      ["-b:a", "128k"],
      join(outputDir, `${height}p30.mp4`),
    ]),
    [
      ["-map_metadata", "-1"],
      ["-filter:v", "scale='min(iw,1280)':-1"],
      ["-frames:v", "1"],
      ["-update", "1"],
      join(outputDir, "poster.jpg"),
    ],
  ]);

export const convertVideo: Converter = {
  extension: "video",
  convert,
};
