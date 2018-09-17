import { Word, WordDocument, WordModel } from './model';

export namespace Words {
    export function create(word: Word): Promise<WordDocument> {
        return WordModel.create(word);
    }

    export function getAll(): Promise<WordDocument[]> {
        return WordModel.find({})
            .collation({ locale: 'nl', strength: 1 })
            .sort({ word: 1 })
            .exec();
    }

    export function getById(id: string): Promise<WordDocument> {
        return WordModel.findById(id).exec();
    }

    export function getByIds(ids: string[]): Promise<WordDocument[]> {
        return WordModel.find({ _id: { $in: ids } }).exec();
    }

    export function generateSimple(word: string): string {
        return word
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^0-9a-z]+/gi, '-');
    }

    export function getSimple(word: Word): string {
        return generateSimple(word.word);
    }
}
