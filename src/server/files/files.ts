import { getFilesConfig } from "../helpers/config.js";

export const getFileUrl = (...parts: string[]) =>
  [getFilesConfig().baseUrl, ...parts].join("/");

export const getFileType = (file: string) =>
  file.slice(file.lastIndexOf(".") + 1);
