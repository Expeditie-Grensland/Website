import mongoose from 'mongoose';

import { MediaFileEmbedded, mediaFileEmbeddedSchema } from '../mediaFiles/model.js';
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
        mediaFile: mediaFileEmbeddedSchema
    }
);

schema.index({ word: 1 }, { collation: { locale: 'nl', strength: 1 } });

export interface Word {
    word: string;
    definitions: string[];
    phonetic?: string;
    mediaFile?: MediaFileEmbedded;
}

export interface WordDocument extends Word, mongoose.Document {
}

export const WordModel = mongoose.model<WordDocument>(WordId, schema);

export type WordOrId = DocumentOrId<WordDocument>;

