import { InferSchemaType, Schema, model } from "mongoose";

import { WordId } from "./id.js";

const wordSchema = new Schema({
  word: { type: String, required: true },
  definitions: [String],
  phonetic: String,
  attachmentFile: String,
});

wordSchema.index({ word: 1 }, { collation: { locale: "nl", strength: 1 } });

export type Word = InferSchemaType<typeof wordSchema>;

export const WordModel = model(WordId, wordSchema);
