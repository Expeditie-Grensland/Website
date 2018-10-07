import * as mongoose from 'mongoose';
import { GeoLocationId } from './id';
import { DocumentOrId } from '../documents/new';
import { ExpeditieId } from '../expedities/id';
import { PersonId } from '../people/id';

export interface GeoLocation {
    _id?: mongoose.Types.ObjectId;
    expeditieId: mongoose.Types.ObjectId;
    personId: mongoose.Types.ObjectId;
    timestamp: number;
    timezone: string;
}

export interface GeoLocationDocument extends GeoLocation, mongoose.Document {
    _id: mongoose.Types.ObjectId;
}

const geoLocationSchema = new mongoose.Schema({
    expeditieId: { type: mongoose.Schema.Types.ObjectId, ref: ExpeditieId },
    personId: { type: mongoose.Schema.Types.ObjectId, ref: PersonId },
    timestamp: Number,
    timezone: String
});

export const geoLocationModel = mongoose.model<GeoLocationDocument>(GeoLocationId, geoLocationSchema);

export type GeoLocationOrId = DocumentOrId<GeoLocationDocument>;
