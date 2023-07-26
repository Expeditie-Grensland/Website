import mongoose, { InferSchemaType } from 'mongoose';

import { WordId } from './id.js';

const wordSchema = new mongoose.Schema(
    {
        word: { type: String, required: true },
        definitions: [String],
        phonetic: String,
        attachmentFile: String,
    }
);

wordSchema.index({ word: 1 }, { collation: { locale: 'nl', strength: 1 } });

export type Word = InferSchemaType<typeof wordSchema>;

export const WordModel = mongoose.model(WordId, wordSchema);
