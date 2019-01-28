import * as mongoose from 'mongoose';
import { MetadatumId } from './id';

/**
 * A Metadatum describes a key-value relation that describes some property of the database itself.
 */

const schema = new mongoose.Schema({
    _id: String,
    value: mongoose.Schema.Types.Mixed
});

export interface Metadatum {
    _id: string;
    value: any;
}

export interface MetadatumDocument extends Metadatum, mongoose.Document {
    _id: string;
}

export const MetadatumModel = mongoose.model<MetadatumDocument>(MetadatumId, schema);

export type MetadatumOrId = MetadatumDocument | string;
