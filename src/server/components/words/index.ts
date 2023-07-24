import mongoose from 'mongoose';

import { Word, WordDocument, WordModel, WordOrId } from './model.js';
import * as Documents from '../documents/index.js';

export const create = (word: Word): Promise<WordDocument> =>
    WordModel.create(word);

export const getAll = (): Promise<WordDocument[]> =>
    WordModel
        .find({})
        .collation({ locale: 'nl', strength: 1 })
        .sort({ word: 1 })
        .exec();

export const getById = (id: mongoose.Types.ObjectId): Promise<WordDocument | null> =>
    WordModel
        .findById(id)
        .exec();

export const getByIds = (ids: mongoose.Types.ObjectId[]): Promise<WordDocument[]> =>
    WordModel
        .find({ _id: { $in: ids } })
        .exec();

export const getDocument = (word: WordOrId): Promise<WordDocument | null> =>
    Documents.getDocument(getById)(word);

