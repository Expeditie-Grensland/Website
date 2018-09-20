import * as mongoose from 'mongoose';

import { MediaFile, MediaFileDocument, mediaFileModel, MediaFileOrId } from './model';
import { Documents } from '../documents/new';

export namespace MediaFiles {
    export const create = (file: MediaFile): Promise<MediaFileDocument> =>
        mediaFileModel.create(file);

    export const createMany = (files: MediaFile[]): Promise<MediaFileDocument[]> =>
        mediaFileModel.insertMany(files);

    export const getById = (id: mongoose.Types.ObjectId): Promise<MediaFileDocument> =>
        mediaFileModel.findById(id).exec();

    export const getDocument = (file: MediaFileOrId): Promise<MediaFileDocument> =>
        Documents.getDocument(getById)(file);
}
