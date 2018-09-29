import * as mongoose from 'mongoose';

import { DocumentOrId } from '../documents/new';
import { MediaFileId } from './id';

export interface MediaFile {
    _id: mongoose.Types.ObjectId;
    ext: string;
    mime: string;
    uses?: MediaFileUse[];
}

export interface MediaFileEmbedded {
    id: mongoose.Types.ObjectId;
    ext: string;
    mime: string;
}

export const mediaFileEmbeddedSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    ext: String,
    mime: String
}, { _id: false });

export interface MediaFileUse {
    model: string;
    id: mongoose.Types.ObjectId;
    field: string;
}

const mediaFileUseSchema = new mongoose.Schema({
    model: String,
    id: mongoose.Schema.Types.ObjectId,
    field: String
}, { _id: false });

export interface MediaFileDocument extends MediaFile, mongoose.Document {
    _id: any;
}

export type MediaFileOrId = DocumentOrId<MediaFileDocument>;

const mediaFileSchema = new mongoose.Schema({
    ext: String,
    mime: String,
    uses: [mediaFileUseSchema]
});

export const mediaFileModel = mongoose.model<MediaFileDocument>(MediaFileId, mediaFileSchema);
