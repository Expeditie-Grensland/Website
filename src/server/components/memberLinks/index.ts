import { memberLinkModel } from "./model.js";

export const getAllMemberLinks = async () =>
  await memberLinkModel.find().sort({ index: 1 });
