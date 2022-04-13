import type { MediaFile } from "db/generated";

const getFileUrl = (file: MediaFile) =>
  `${process.env.MEDIAFILE_BASE_URL}/${file.name}.${file.extension}`;

export { getFileUrl };
