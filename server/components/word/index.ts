import { IWord, WordDocument, WordSchema } from './model';

export namespace Word {
    export function create(word: IWord): Promise<WordDocument> {
        return WordSchema.create(word);
    }

    export function getAll(): Promise<WordDocument[]> {
        return WordSchema.find({})
            .collation({ locale: 'nl', strength: 1 })
            .sort({ word: 1 })
            .exec();
    }

    export function getById(id: string): Promise<WordDocument> {
        return WordSchema.findById(id).exec();
    }

    export function getByIds(ids: string[]): Promise<WordDocument[]> {
        return WordSchema.find({ _id: { $in: ids } }).exec();
    }

    export function generateSimple(word: string): string {
        return word
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^0-9a-z]+/gi, '-');
    }

    export function getSimple(word: IWord): string {
        return generateSimple(word.word);
    }
}
