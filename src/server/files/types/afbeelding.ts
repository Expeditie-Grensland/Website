import gm from "gm";
import path from "node:path";
import { Converter } from "../convert.js";

const magick = gm.subClass({ imageMagick: "7+" });

export type ImageVersion = {
  name: string;
  format: "jpg" | "webp";
  quality?: number;
  width?: number;
};

const transformVersion = (imgVersion: ImageVersion, inputImg: gm.State) => {
  let img = inputImg
    .setFormat(imgVersion.format)
    .colorspace("sRGB")
    .strip()
    .quality(imgVersion.quality || 80);

  if (imgVersion.format === "jpg") img = img.samplingFactor(2, 2);

  if (imgVersion.width)
    img = img.thumbnail(imgVersion.width, undefined as unknown as number, ">");

  return img;
};

export const convertWithMagick = async (
  inputFile: string,
  outputDir: string,
  imgVersions: ImageVersion[]
) => {
  for (const imgVersion of imgVersions) {
    await new Promise<void>((resolve, reject) => {
      transformVersion(imgVersion, magick(inputFile)).write(
        path.join(outputDir, `${imgVersion.name}.${imgVersion.format}`),
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
};

const versions: ImageVersion[] = [
  {
    name: "origineel",
    format: "jpg",
    quality: 100,
  },
  {
    name: "volledig",
    format: "jpg",
  },
  {
    name: "normaal",
    format: "jpg",
    width: 1500,
  },
  {
    name: "normaal",
    format: "webp",
    width: 1500,
  },
  {
    name: "klein",
    format: "jpg",
    width: 500,
  },
  {
    name: "klein",
    format: "webp",
    width: 500,
  },
  {
    name: "miniscuul",
    format: "jpg",
    width: 30,
  },
];

export const convertAfbeelding: Converter = {
  extension: "afbeelding",
  convert: (inputFile, outputDir) =>
    convertWithMagick(inputFile, outputDir, versions),
};
