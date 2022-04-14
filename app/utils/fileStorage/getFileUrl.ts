import type { MediaFile } from "~/generated/db";

const getFileUrl = (file: MediaFile) =>
  `${process.env.MEDIAFILE_BASE_URL}/${file.name}.${file.extension}`;

export default getFileUrl;
