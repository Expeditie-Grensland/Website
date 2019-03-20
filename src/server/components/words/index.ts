import { Word, WordDocument, WordModel, WordOrID } from './model';
import { MediaFileOrId, MediaFiles } from '../mediaFiles';
import { Util } from '../documents/util';
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

    export const setMediaFile = (word: WordOrID, file: MediaFileOrId): Promise<WordDocument | null> =>
        MediaFiles.ensureMime(file, ['audio/mpeg', 'video/mp4'])
            .then(MediaFiles.getEmbed)
            .then(embed => WordModel.findByIdAndUpdate(
                Util.getObjectID(word),
                { mediaFile: embed },
                { new: true })
                .exec());
}

export { Word, WordDocument, WordOrID } from './model';
export { WordId } from './id';

