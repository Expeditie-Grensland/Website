import * as mongoose from 'mongoose';

import { MediaFile, MediaFileDocument, MediaFileId, mediaFileModel, MediaFileOrId } from './model';
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
}

export { MediaFile, MediaFileDocument, MediaFileId, MediaFileOrId, mediaFileModel } from './model';
export { MediaFileHelper } from './helper';
