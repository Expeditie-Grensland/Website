import { config } from "./configHelper.js";

export const getFileUrl = (file: string) =>
  `${config.EG_FILES_BASE_URL}/${file}`;
