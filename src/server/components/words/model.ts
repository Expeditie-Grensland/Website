import * as mongoose from 'mongoose';
import { DocumentOrID } from '../documents/util';
import { Words } from '.';
import { MediaFileEmbedded, mediaFileEmbeddedSchema } from '../mediaFiles/model';

export const WordID = 'Words';

/**
 * FIXME: Add description
 */

const schema = new mongoose.Schema(
    {
        word: String,
        definitions: [String],
        phonetic: String,
        audioFile: mediaFileEmbeddedSchema
    }
);

schema.index({ word: 1 }, { collation: { locale: 'nl', strength: 1 } });

export interface Word {
    word: string;
    definitions: string[];
    phonetic?: string;
    audioFile?: MediaFileEmbedded;
}

export interface WordDocument extends Word, mongoose.Document {
}

export const WordModel = mongoose.model<WordDocument>(WordID, schema);

export type WordOrID = DocumentOrID<WordDocument>;

