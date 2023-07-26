import { memberLinkModel } from "./model.js";

export const getAll = async () =>
  await memberLinkModel.find().sort({ index: 1 });
