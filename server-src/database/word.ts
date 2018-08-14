import { TableData, Tables } from './tables';

import WordDocument = TableData.Word.WordDocument;

export namespace Word {
    import Word = TableData.Word.Word;
    import WordOrId = TableData.WordOrID;

    export function createWord(word: Word): Promise<WordDocument> {
        return Tables.Word.create(word);
    }

    export function getWord(word: string): Promise<WordDocument> {
        return Tables.Word.findOne({ word: word }).collation({locale: 'nl', strength: 1}).exec();
    }

    export function getWords(): Promise<WordDocument[]> {
        return Tables.Word.find({}).collation({locale: 'nl', strength: 1}).sort({word: 1}).exec();
    }

    export function getWordById(id: string): Promise<WordDocument> {
        return Tables.Word.findById(id).exec();
    }

    export function getWordsByIds(ids: string[]): Promise<WordDocument[]> {
        return Tables.Word.find({ _id: { $in: ids } }).exec();
    }
}
