import * as mongoose from 'mongoose';
import { DocumentOrId } from '../documents/new';

export const MediaFileId = 'MediaFile';

export interface MediaFile {
    _id?: any,
    ext: string,
    mime: string,
    uses?: {
        id: mongoose.Types.ObjectId,
        model: String,
        field: String
    }[]
}

export interface MediaFileDocument extends MediaFile, mongoose.Document {
    _id: any
}

export type MediaFileOrId = DocumentOrId<MediaFileDocument>;

const schema = new mongoose.Schema({
    ext: String,
    mime: String,
    uses: [{
        id: mongoose.Schema.Types.ObjectId,
        model: String,
        field: String
    }]
});

export const mediaFileModel = mongoose.model<MediaFileDocument>(MediaFileId, schema);
