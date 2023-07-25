import mongoose from "mongoose";

import { Word, WordDocument, WordModel } from "./model.js";

export const create = (word: Word): Promise<WordDocument> =>
  WordModel.create(word);

export const getAll = (): Promise<WordDocument[]> =>
  WordModel.find({})
    .collation({ locale: "nl", strength: 1 })
    .sort({ word: 1 })
    .exec();

export const getById = (
  id: mongoose.Types.ObjectId
): Promise<WordDocument | null> => WordModel.findById(id).exec();
