import mongoose from "mongoose";

import { WordModel } from "./model.js";

export const getAllWords = async () =>
  await WordModel.find({})
    .collation({ locale: "nl", strength: 1 })
    .sort({ word: 1 });

export const getWordById = async (id: mongoose.Types.ObjectId) =>
  await WordModel.findById(id);
