import gm from "gm";
import path from "node:path";

const magick = gm.subClass({ imageMagick: "7+" });

export type ImageTransformer = (img: gm.State) => gm.State;

export type ImageVersion = {
  name: string;
  transformers: ImageTransformer[];
};

export const transformImgToJpeg: ImageTransformer = (img) =>
  img
    .setFormat("jpeg")
    .colorspace("sRGB")
    .samplingFactor(2, 2)
    .quality(80)
    .strip();

export const transformImgToWebp: ImageTransformer = (img) =>
  img.setFormat("webp").colorspace("sRGB").quality(80).strip();

export const transformImgWidth: (width: string) => ImageTransformer =
  (width) => (img) =>
    img.out("-thumbnail", width);

export const convertWithMagick = async (
  inputFile: string,
  outputDir: string,
  imgVersions: ImageVersion[]
) => {
  for (const imgVersion of imgVersions) {
    await new Promise<void>((resolve, reject) => {
      imgVersion.transformers
        .reduce((img, conv) => conv(img), magick(inputFile))
        .write(path.join(outputDir, imgVersion.name), (err) => {
          if (err) reject(err);
          else resolve();
        });
    });
  }
};
