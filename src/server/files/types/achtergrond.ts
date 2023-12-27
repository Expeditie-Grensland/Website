import { Converter } from "../convert.js";
import { convertAfbeelding } from "./afbeelding.js";

export const convertAchtergrond: Converter = {
  extension: "achtergrond",
  convert: convertAfbeelding.convert,
};
