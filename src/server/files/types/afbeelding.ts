import { join } from "node:path";
import sharp, { type Sharp } from "sharp";
import type { Converter } from "../convert.js";

const variants = [
  {
    name: "origineel.jpg",
    func: (image: Sharp) =>
      image.jpeg({ quality: 100, chromaSubsampling: "4:4:4" }),
  },

  {
    name: "volledig.webp",
    func: (image: Sharp) => image.webp(),
  },

  {
    name: "volledig.jpg",
    func: (image: Sharp) => image.jpeg({ mozjpeg: true }),
  },

  {
    name: "normaal.webp",
    func: (image: Sharp) =>
      image.resize({ width: 1500, withoutEnlargement: true }).webp(),
  },

  {
    name: "normaal.jpg",
    func: (image: Sharp) =>
      image
        .resize({ width: 1500, withoutEnlargement: true })
        .jpeg({ mozjpeg: true }),
  },

  {
    name: "klein.webp",
    func: (image: Sharp) =>
      image.resize({ width: 500, withoutEnlargement: true }).webp(),
  },

  {
    name: "klein.jpg",
    func: (image: Sharp) =>
      image
        .resize({ width: 500, withoutEnlargement: true })
        .jpeg({ mozjpeg: true }),
  },

  {
    name: "miniscuul.webp",
    func: (image: Sharp) =>
      image.resize({ width: 30, withoutEnlargement: true }).webp(),
  },

  {
    name: "miniscuul.jpg",
    func: (image: Sharp) =>
      image
        .resize({ width: 30, withoutEnlargement: true })
        .jpeg({ mozjpeg: true }),
  },
];

const convert = async (inputFile: string, outputDir: string) => {
  const image = sharp(inputFile).rotate().toColorspace("sRGB");

  await Promise.all(
    variants.map(({ name, func }) =>
      func(image.clone()).toFile(join(outputDir, name))
    )
  );
};

export const convertAfbeelding: Converter = {
  extension: "afbeelding",
  convert,
};
