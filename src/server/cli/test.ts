import { convertAndUploadFile } from "../files/convert.js";
import { convertAchtergrond } from "../files/types/achtergrond.js";

await convertAndUploadFile(
  "test-file",
  "/home/martijn/Test/input.jpg",
  convertAchtergrond
);
