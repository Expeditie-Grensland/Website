import mongoose from "mongoose";

import { QuoteModel } from "./model.js";

export const getAll = async () =>
  await QuoteModel.find({})
    .collation({ locale: "nl", strength: 1 })
    .sort({ "dateTime.stamp": 1 });

export const getById = async (id: mongoose.Types.ObjectId) =>
  await QuoteModel.findById(id);
