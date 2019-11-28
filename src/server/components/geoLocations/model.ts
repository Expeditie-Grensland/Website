import * as mongoose from 'mongoose';

import { GeoLocationId } from './id';
import { DocumentOrId } from '../documents';
import { ExpeditieId } from '../expedities/id';
import { PersonId } from '../people/id';

export interface GeoLocation {
    _id?: mongoose.Types.ObjectId;
    expeditieId: mongoose.Types.ObjectId;
    personId: mongoose.Types.ObjectId;
    time: number;
    timezone?: string;
    latitude: number;
    longitude: number;
    altitude?: number;
    horizontalAccuracy?: number;
    verticalAccuracy?: number;
    speed?: number;
    speedAccuracy?: number;
    bearing?: number;
    bearingAccuracy?: number;
    visualArea?: number;
}

export interface GeoLocationDocument extends GeoLocation, mongoose.Document {
    _id: mongoose.Types.ObjectId;
    timezone: string;
    visualArea: number;
}

const geoLocationSchema = new mongoose.Schema({
    expeditieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ExpeditieId
    },
    personId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: PersonId
    },
    time: {
        type: Number,
        required: true,
        set: (t: number) => t > 1e10 ? t / 1000 : t
    },
    timezone: {
        type: String,
        default: 'Europe/Amsterdam'
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    altitude: Number,
    horizontalAccuracy: Number,
    verticalAccuracy: Number,
    speed: Number,
    speedAccuracy: Number,
    bearing: Number,
    bearingAccuracy: Number,
    visualArea: {
        type: Number,
        default: Number.POSITIVE_INFINITY
    }
})
    .index({
        expeditieId: 1,
        visualArea: -1
    })
    .index({
        expeditieId: 1,
        latitude: 1
    })
    .index({
        expeditieId: 1,
        longitude: 1
    })
    .index({
        expeditieId: 1,
        personId: 1,
        time: 1
    }, { unique: true });

export const geoLocationModel = mongoose.model<GeoLocationDocument>(GeoLocationId, geoLocationSchema);

export type GeoLocationOrId = DocumentOrId<GeoLocationDocument>;
