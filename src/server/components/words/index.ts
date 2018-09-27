import { Word, WordDocument, WordID, WordModel, WordOrID } from './model';
import { MediaFileOrId, MediaFiles } from '../mediaFiles';
import { MediaFileUse } from '../mediaFiles/model';
import * as mongoose from 'mongoose';
import { Util } from '../documents/util';

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

    export const getDocument = (word: WordOrID): Promise<WordDocument> =>
        Util.getDocument(getById)(word);

    export const setAudioFile = (word: WordOrID, file: MediaFileOrId): Promise<WordDocument> => {
        const usage: MediaFileUse = {
            model: WordID,
            id: mongoose.Types.ObjectId(Util.getObjectID(word)),
            field: 'audioFile'
        };

        return MediaFiles.ensureMime(file, ['audio/mpeg'])
            .then(file => MediaFiles.addUse(file, usage))
            .then(MediaFiles.getEmbed)
            .then(embed => getDocument(word)
                .then(word => MediaFiles.removeUse(word.audioFile, usage))
                .then(() => embed))
            .then(embed => WordModel.findByIdAndUpdate(
                Util.getObjectID(word),
                { audioFile: embed },
                { new: true })
                .exec());
    };
}
