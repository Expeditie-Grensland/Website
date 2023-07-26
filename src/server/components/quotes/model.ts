import { InferSchemaType, Schema, model } from "mongoose";

import { dateTimeSchema, dateTimeSchemaDefault } from "../dateTime/model.js";
import { QuoteId } from "./id.js";

const quoteSchema = new Schema({
  quote: { type: String, required: true },
  quotee: { type: String, required: true },
  dateTime: {
    type: dateTimeSchema,
    default: dateTimeSchemaDefault,
  },
  context: { type: String, required: true },
  attachmentFile: String,
});

quoteSchema.index({ "dateTime.stamp": 1 });

export type Quote = InferSchemaType<typeof quoteSchema>;

export const QuoteModel = model(QuoteId, quoteSchema);
