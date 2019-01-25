import { Word, WordDocument, WordModel, WordOrID } from './model';
import { MediaFileOrId, MediaFiles } from '../mediaFiles';
import { MediaFileUse } from '../mediaFiles/model';
import * as mongoose from 'mongoose';
import { Util } from '../documents/util';
import { Documents } from '../documents/new';
import { WordId } from './id';

export namespace Words {
    export const create = (word: Word): Promise<WordDocument> =>
        WordModel.create(word);

    export const getAll = (): Promise<WordDocument[]> =>
        WordModel
            .find({})
            .collation({ locale: 'nl', strength: 1 })
            .sort({ word: 1 })
            .exec();

    export const getById = (id: string): Promise<WordDocument | null> =>
        WordModel
            .findById(id)
            .exec();

    export const getByIds = (ids: string[]): Promise<WordDocument[]> =>
        WordModel
            .find({ _id: { $in: ids } })
            .exec();

    export const getDocument = (word: WordOrID): Promise<WordDocument | null> =>
        Util.getDocument(getById)(word);

    export const setMediaFile = (word: WordOrID, file: MediaFileOrId): Promise<WordDocument | null> => {
        const usage: MediaFileUse = {
            model: WordId,
            id: mongoose.Types.ObjectId(Util.getObjectID(word)),
            field: 'mediaFile'
        };

        return MediaFiles.ensureMime(file, ['audio/mpeg', 'video/mp4'])
            .then(file => MediaFiles.addUse(file, usage))
            // TODO: MA. - Find solution for all those ensureNotNulls everywhere.
            .then(Documents.ensureNotNull)
            .then(MediaFiles.getEmbed)
            .then(embed => getDocument(word)
                .then(Documents.ensureNotNull)
                .then(word => word.mediaFile ? MediaFiles.removeUse(word.mediaFile, usage) : undefined)
                .then(() => embed))
            .then(embed => WordModel.findByIdAndUpdate(
                Util.getObjectID(word),
                { mediaFile: embed },
                { new: true })
                .exec());
    };
}

export { Word, WordDocument, WordOrID } from './model';
export { WordId } from './id';

