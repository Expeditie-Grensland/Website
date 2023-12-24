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
    name: "miniscuul.jpg",
    transformers: [transformImgToJpeg, transformImgWidth("30")],
  },
];

export const convertAfbeelding: Converter = {
  extension: "afbeelding",
  convert: (inputFile, outputDir) =>
    convertWithMagick(inputFile, outputDir, versions),
};
