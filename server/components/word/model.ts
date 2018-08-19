import * as mongoose from 'mongoose';
import { DocumentOrID } from '../document/util';
import { Word } from '.';

export const WordID = 'Word';

/**
 * FIXME: Add description
 */

const schema = new mongoose.Schema(
    {
        word: String,
        definitions: [String],
        phonetic: String,
        audio: String
    },
    {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

schema.virtual('simple').get(function() {
    return Word.generateSimple(this.word);
});

schema.index({ word: 1 }, { collation: { locale: 'nl', strength: 1 } });

export interface IWord {
    word: string;
    definitions: string[];
    phonetic?: string;
    audio?: string;
    readonly simple?: string;
}

export interface WordDocument extends IWord, mongoose.Document {}

export const WordSchema = mongoose.model<WordDocument>(WordID, schema);

export type WordOrID = DocumentOrID<WordDocument>;

