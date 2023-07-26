import mongoose from "mongoose";

import { QuoteModel } from "./model.js";

export const getAllQuotes = async () =>
  await QuoteModel.find({})
    .collation({ locale: "nl", strength: 1 })
    .sort({ "dateTime.stamp": 1 });

export const getQuoteById = async (id: mongoose.Types.ObjectId) =>
  await QuoteModel.findById(id);
