import * as mongoose from 'mongoose';
import { DocumentOrID } from '../documents/util';
import { Words } from '.';

export const WordID = 'Words';

/**
 * FIXME: Add description
 */

const schema = new mongoose.Schema(
    {
        word: String,
        definitions: [String],
        phonetic: String,
        audio: String
    }
);

schema.index({ word: 1 }, { collation: { locale: 'nl', strength: 1 } });

export interface IWord {
    word: string;
    definitions: string[];
    phonetic?: string;
    audio?: string;
}

export interface WordDocument extends IWord, mongoose.Document {}

export const WordModel = mongoose.model<WordDocument>(WordID, schema);

export type WordOrID = DocumentOrID<WordDocument>;

