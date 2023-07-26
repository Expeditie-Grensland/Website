import mongoose from 'mongoose';

import { WordId } from './id.js';
import { DocumentOrId } from '../documents/index.js';

/**
 * FIXME: Add description
 */

const schema = new mongoose.Schema(
    {
        word: String,
        definitions: [String],
        phonetic: String,
        attachmentFile: String,
    }
);

schema.index({ word: 1 }, { collation: { locale: 'nl', strength: 1 } });

export interface Word {
    word: string;
    definitions: string[];
    phonetic?: string;
    attachmentFile?: string;
}

export interface WordDocument extends Word, mongoose.Document {
}

export const WordModel = mongoose.model<WordDocument>(WordId, schema);

export type WordOrId = DocumentOrId<WordDocument>;

