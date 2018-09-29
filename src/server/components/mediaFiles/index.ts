import * as mongoose from 'mongoose';

import { MediaFile, MediaFileDocument, MediaFileEmbedded, mediaFileModel, MediaFileOrId, MediaFileUse } from './model';
import { MediaFileHelper } from './helper';
import { Documents } from '../documents/new';
import { MediaFileId } from './id';

export namespace MediaFiles {
    export const create = (file: MediaFile): Promise<MediaFileDocument> =>
        mediaFileModel.create(file);

    export const remove = (file: MediaFileOrId): Promise<MediaFileDocument> =>
        getDocument(file)
            .then(Documents.ensureNotNull)
            .then(MediaFileHelper.ensureFileNotInUse)
            .then(MediaFileHelper.deleteFile)
            .then((file: MediaFileDocument) => file.remove());

    export const createMany = (files: MediaFile[]): Promise<MediaFileDocument[]> =>
        mediaFileModel.insertMany(files);

    export const getAll = (): Promise<MediaFileDocument[]> =>
        mediaFileModel.find({}).exec();

    export const getById = (id: mongoose.Types.ObjectId): Promise<MediaFileDocument | null> =>
        mediaFileModel.findById(id).exec();

    export const getDocument = (file: MediaFileOrId): Promise<MediaFileDocument | null> =>
        Documents.getDocument(getById)(file);

    export const getEmbed = (file: MediaFileOrId): Promise<MediaFileEmbedded> =>
        getDocument(file)
            .then(Documents.ensureNotNull)
            .then(file => {
                return { id: file._id, ext: file.ext, mime: file.mime };
            });

    export const addUse = (file: MediaFileOrId, usage: MediaFileUse): Promise<MediaFileDocument | null> =>
        mediaFileModel
            .findByIdAndUpdate(
                Documents.getObjectId(file),
                { $push: { uses: usage } },
                { new: true })
            .exec();


    export const removeUse = (file: MediaFileEmbedded, usage: MediaFileUse): Promise<void> => {
        if (file === undefined || file === null || file.id === undefined || file.id === null)
            return Promise.resolve();

        return mediaFileModel
            .findByIdAndUpdate(
                Documents.getObjectId(file.id),
                { $pull: { uses: usage } },
                { new: true })
            .exec()
            .then(() => undefined);
    };

    export const getUrl = (file: MediaFileEmbedded): string =>
        file !== undefined ? `/media/${file.id}.${file.ext}`: '';

    export const ensureMime = (file: MediaFileOrId, mime: string[]): Promise<MediaFileDocument> =>
        getDocument(file)
            .then(Documents.ensureNotNull)
            .then(file => {
                if (!mime.includes(file.mime))
                    throw new Error('File type is not allowed');
                return file;
            })
}

export { MediaFile, MediaFileDocument, MediaFileOrId, mediaFileModel } from './model';
export { MediaFileHelper } from './helper';
export { MediaFileId } from './id';
