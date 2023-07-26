import mongoose from "mongoose";

import { Word, WordModel } from "./model.js";

export const create = async (word: Word) => await WordModel.create(word);

export const getAll = async () =>
  await WordModel.find({})
    .collation({ locale: "nl", strength: 1 })
    .sort({ word: 1 });

export const getById = async (id: mongoose.Types.ObjectId) =>
  await WordModel.findById(id);
