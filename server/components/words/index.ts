import { Word, WordDocument, WordModel } from './model';

export namespace Words {
    export const create = (word: Word): Promise<WordDocument> =>
        WordModel.create(word);

    export const getAll = (): Promise<WordDocument[]> =>
        WordModel
            .find({})
            .collation({ locale: 'nl', strength: 1 })
            .sort({ word: 1 })
            .exec();

    export const getById = (id: string): Promise<WordDocument> =>
        WordModel
            .findById(id)
            .exec();

    export const getByIds = (ids: string[]): Promise<WordDocument[]> =>
        WordModel
            .find({ _id: { $in: ids } })
            .exec();
}
