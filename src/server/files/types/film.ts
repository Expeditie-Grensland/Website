import { platform } from "node:os";
import { join } from "node:path";
import { runProcess } from "../../helpers/process.js";
import { Converter } from "../convert.js";

export type FilmOptions = {
  resolution: 2160 | 1440 | 1080 | 720;
  fps: 60 | 30;
};

const convert = async (
  inputFile: string,
  outputDir: string,
  { resolution: inHeight, fps: inFps }: FilmOptions
) =>
  await runProcess("ffmpeg", [
    ["-hide_banner", "-loglevel", "info", "-nostdin"],
    platform() === "win32" && ["-hwaccel", "auto"],
    ["-i", inputFile],
    [
      // Origineel (zonder converteren)
      ["-map_metadata", "-1"],
      ["-movflags", "+faststart"],
      ["-c:v", "copy"],
      ["-bsf:v", "filter_units=remove_types=6"],
      ["-c:a", "copy"],
      join(outputDir, "origineel.mp4"),
    ],
    [
      // Dash
      ["-map_metadata", "-1"],
      ["-preset", "veryslow"],
      ["-f", "dash"],
      ["-use_template", "1"],
      ["-use_timeline", "1"],
      ["-seg_duration", "2"],
      ["-init_seg_name", "stream$RepresentationID$-init.$ext$"],
      ["-media_seg_name", "stream$RepresentationID$-chunk$Number%05d$.$ext$"],
      ["-adaptation_sets", "id=0,streams=v id=1,streams=a"],
      ["-hls_playlist", "1"],
      ["-hls_master_name", "hls.m3u8"],
      ["-c:v", "libx264"],
      ["-profile:v", "high"],
      ["-bsf:v", "filter_units=remove_types=6"],
      ["-c:a", "aac"],
      [
        // Dash video streams
        { width: 3840, height: 2160, fps: 60, bitrate: 18000 },
        { width: 2160, height: 1440, fps: 60, bitrate: 13500 },
        { width: 1920, height: 1080, fps: 60, bitrate: 9000 },
        { width: 3840, height: 2160, fps: 30, bitrate: 12000 },
        { width: 2160, height: 1440, fps: 30, bitrate: 9000 },
        { width: 1920, height: 1080, fps: 30, bitrate: 6000 },
        { width: 1280, height: 720, fps: 60, bitrate: 3000 },
        { width: 1280, height: 720, fps: 30, allFps: true, bitrate: 2000 },
        { width: 960, height: 540, fps: 30, allFps: true, bitrate: 1000 },
        { width: 640, height: 360, fps: 30, allFps: true, bitrate: 500 },
      ]
        .filter(
          ({ height, fps, allFps }) =>
            height <= inHeight && (fps == inFps || allFps)
        )
        .map(({ width, height, fps, bitrate }, i) => [
          ["-map", "0:v:0"],
          [`-b:v:${i}`, `${bitrate}k`],
          [`-maxrate:v:${i}`, `${bitrate}k`],
          [`-bufsize:v:${i}`, `${bitrate * 1.5}k`],
          [
            `-filter:v:${i}`,
            `scale=${width}:${height}:force_original_aspect_ratio=decrease,format=yuv420p`,
          ],
          [`-r:v:${i}`, `${fps}`],
          [`-g:v:${i}`, `${fps * 2}`],
          [`-keyint_min:v:${i}`, `${fps}`],
        ]),
      [
        // Dash audio streams
        { bitrate: 192 },
        { bitrate: 128 },
        { bitrate: 96 },
      ].map(({ bitrate }, i) => [
        ["-map", "0:a:0"],
        [`-b:a:${i}`, `${bitrate}k`],
      ]),
      join(outputDir, "dash.mpd"),
    ],
    [
      // Terugval (720p @ 30fps)
      ["-map_metadata", "-1"],
      ["-preset", "veryslow"],
      ["-movflags", "+faststart"],
      ["-c:v", "libx264"],
      ["-crf:v", "23"],
      [
        "-filter:v",
        `scale=1280:720:force_original_aspect_ratio=decrease,format=yuv420p`,
      ],
      ["-r:v", "30"],
      ["-bsf:v", "filter_units=remove_types=6"],
      ["-c:a", "aac"],
      ["-b:a", "128k"],
      join(outputDir, `720p30.mp4`),
    ],
    [
      // Poster
      ["-map_metadata", "-1"],
      ["-ss", "3"],
      ["-filter:v", "scale=1280:720:force_original_aspect_ratio=decrease"],
      ["-frames:v", "1"],
      ["-update", "1"],
      join(outputDir, "poster.jpg"),
    ],
  ]);

export const convertFilm = (options: FilmOptions): Converter => ({
  extension: "film-dash",
  convert: (input, output) => convert(input, output, options),
});
