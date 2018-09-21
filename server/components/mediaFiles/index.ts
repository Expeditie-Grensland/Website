import * as mongoose from 'mongoose';

import { MediaFile, MediaFileDocument, MediaFileEmbedded, MediaFileId, mediaFileModel, MediaFileOrId, MediaFileUse } from './model';
import { MediaFileHelper } from './helper';
import { Documents } from '../documents/new';

export namespace MediaFiles {
    export const create = (file: MediaFile): Promise<MediaFileDocument> =>
        Promise.resolve(file)
            .then(MediaFileHelper.ensureFileExists)
            .then(mediaFileModel.create);

    export const remove = (file: MediaFileOrId): Promise<MediaFileDocument> =>
        getDocument(file)
            .then(MediaFileHelper.deleteFile)
            .then(file => file.remove());

    export const createMany = (files: MediaFile[]): Promise<MediaFileDocument[]> =>
        mediaFileModel.insertMany(files);

    export const getAll = (): Promise<MediaFileDocument[]> =>
        mediaFileModel.find({}).exec();

    export const getById = (id: mongoose.Types.ObjectId): Promise<MediaFileDocument> =>
        mediaFileModel.findById(id).exec();

    export const getDocument = (file: MediaFileOrId): Promise<MediaFileDocument> =>
        Documents.getDocument(getById)(file);

    export const getEmbed = (file: MediaFileOrId): Promise<MediaFileEmbedded> =>
        getDocument(file)
            .then(file => {
                return { id: file._id, ext: file.ext, mime: file.mime };
            });

    export const addUse = (file: MediaFileOrId, usage: MediaFileUse): Promise<MediaFileDocument> =>
        mediaFileModel
            .findByIdAndUpdate(
                Documents.getObjectId(file),
                { $push: { uses: usage } },
                { new: true })
            .exec();


    export const removeUse = (file: MediaFileEmbedded, usage: MediaFileUse): Promise<void> => {
        if (file === undefined || file === null || file.id === undefined || file.id === null)
            return;

        return mediaFileModel
            .findByIdAndUpdate(
                Documents.getObjectId(file.id),
                { $pull: { uses: usage } },
                { new: true })
            .exec()
            .then(() => undefined);
    };
}

export { MediaFile, MediaFileDocument, MediaFileId, MediaFileOrId, mediaFileModel } from './model';
export { MediaFileHelper } from './helper';
