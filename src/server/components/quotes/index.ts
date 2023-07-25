import mongoose from "mongoose";

import { QuoteDocument, QuoteModel } from "./model.js";

export const getAll = (): Promise<QuoteDocument[]> =>
  QuoteModel.find({})
    .collation({ locale: "nl", strength: 1 })
    .sort({ "dateTime.stamp": 1 })
    .exec();

export const getById = (
  id: mongoose.Types.ObjectId
): Promise<QuoteDocument | null> => QuoteModel.findById(id).exec();
