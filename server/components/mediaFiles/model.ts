import * as mongoose from 'mongoose';

import { DocumentOrId } from '../documents/new';

export interface MediaFile {
    _id: mongoose.Types.ObjectId,
    ext: string,
    mime: string
    uses?: MediaFileUse[]
}

export interface MediaFileEmbedded {
    model: string,
    id: mongoose.Types.ObjectId,
    field: string
}

export const mediaFileEmbeddedSchemaType = {
    model: String,
    id: mongoose.Schema.Types.ObjectId,
    field: String
};

export interface MediaFileUse {
    id: mongoose.Types.ObjectId,
    ext: string,
    mime: string
}

const mediaFileUseSchemaType = {
    id: mongoose.Schema.Types.ObjectId,
    ext: String,
    mime: String
};

export interface MediaFileDocument extends MediaFile, mongoose.Document {
    _id: any
}

export const MediaFileId = 'MediaFile';

export type MediaFileOrId = DocumentOrId<MediaFileDocument>;

const mediaFileSchema = new mongoose.Schema({
    ext: String,
    mime: String,
    uses: [mediaFileUseSchemaType]
});

export const mediaFileModel = mongoose.model<MediaFileDocument>(MediaFileId, mediaFileSchema);
