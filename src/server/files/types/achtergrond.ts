import { Converter } from "../convert.js";
import {
  ImageVersion,
  convertWithMagick,
  transformImgToJpeg,
  transformImgToWebp,
  transformImgWidth,
} from "./imageWithMagick.js";

const versions: ImageVersion[] = [
  {
    name: "volledig.jpg",
    transformers: [transformImgToJpeg],
  },
  {
    name: "normaal.jpg",
    transformers: [transformImgToJpeg, transformImgWidth("1500>")],
  },
  {
    name: "normaal.webp",
    transformers: [transformImgToWebp, transformImgWidth("1500>")],
  },
  {
    name: "klein.jpg",
    transformers: [transformImgToJpeg, transformImgWidth("500>")],
  },
  {
    name: "klein.webp",
    transformers: [transformImgToWebp, transformImgWidth("500>")],
  },
  {
    name: "miniscuul.jpg",
    transformers: [transformImgToJpeg, transformImgWidth("30")],
  },
];

export const convertAchtergrond: Converter = {
  extension: "achtergrond",
  convert: (inputFile, outputDir) =>
    convertWithMagick(inputFile, outputDir, versions),
};
