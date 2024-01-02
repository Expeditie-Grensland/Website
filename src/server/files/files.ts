import { config } from "../helpers/configHelper.js";

export const getFileUrl = (...parts: string[]) =>
  [config.EG_FILES_BASE_URL, ...parts].join("/");

export const getFileType = (file: string) =>
  file.slice(file.lastIndexOf(".") + 1);
