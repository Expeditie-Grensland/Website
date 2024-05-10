import mongoose from "mongoose";

import { AfkoModel } from "./model.js";

export const getAllAfkos = async () =>
  await AfkoModel.find({})
    .collation({ locale: "nl", strength: 1 })
    .sort({ afko: 1 });

export const getAfkoById = async (id: mongoose.Types.ObjectId) =>
  await AfkoModel.findById(id);
