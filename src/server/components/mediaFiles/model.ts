import * as mongoose from 'mongoose';

import {DocumentOrId} from '../documents/new';
import {MediaFileId} from './id';

export interface MediaFile {
    _id?: mongoose.Types.ObjectId;
    ext: string;
    mime: string;
    restricted: boolean;
}

export interface MediaFileEmbedded {
    id: mongoose.Types.ObjectId;
    ext: string;
    mime: string;
    restricted: boolean;
}

export const mediaFileEmbeddedSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    ext: String,
    mime: String,
    restricted: Boolean
}, { _id: false });

export interface MediaFileDocument extends MediaFile, mongoose.Document {
    _id: any;
}

export type MediaFileOrId = DocumentOrId<MediaFileDocument>;

const mediaFileSchema = new mongoose.Schema({
    ext: String,
    mime: String,
    restricted: Boolean
});

export const mediaFileModel = mongoose.model<MediaFileDocument>(MediaFileId, mediaFileSchema);
