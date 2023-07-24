import * as mongoose from 'mongoose';

import { MediaFile, MediaFileDocument, MediaFileEmbedded, mediaFileModel, MediaFileOrId } from './model';
import * as MediaFileHelper from './helper';
import * as Documents from '../documents';

export const create = (file: MediaFile): Promise<MediaFileDocument> =>
    mediaFileModel.create(file);

export const remove = (file: MediaFileOrId): Promise<MediaFileDocument> =>
    getDocument(file)
        .then(Documents.ensureNotNull)
        .then((file: MediaFileDocument) => file.deleteOne())
        .then(MediaFileHelper.deleteFile);

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
            return { id: file._id, ext: file.ext, mime: file.mime, restricted: file.restricted };
        });

export const getUrl = (file: MediaFileEmbedded | MediaFileDocument): string =>
    file !== undefined ? `/media/${file.id}.${file.ext}` : '';

export const ensureMime = (file: MediaFileOrId, mime: string[]): Promise<MediaFileDocument> =>
    getDocument(file)
        .then(Documents.ensureNotNull)
        .then(file => {
            if (!mime.includes(file.mime))
                throw new Error('File type is not allowed');
            return file;
        });
