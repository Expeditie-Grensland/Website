import * as mongoose from 'mongoose';

import { GeoLocationId } from './id';
import { DocumentOrId } from '../documents';
import { ExpeditieId } from '../expedities/id';
import { PersonId } from '../people/id';
import { DateTimeInternal, dateTimeSchema, dateTimeSchemaDefault } from '../dateTime/model';

export interface GeoLocation {
    expeditieId: mongoose.Types.ObjectId;
    personId: mongoose.Types.ObjectId;
    dateTime: DateTimeInternal;
    latitude: number;
    longitude: number;
    altitude?: number;
    horizontalAccuracy?: number;
    verticalAccuracy?: number;
    speed?: number;
    speedAccuracy?: number;
    bearing?: number;
    bearingAccuracy?: number;
}

export interface GeoLocationDocument extends GeoLocation, mongoose.Document {
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
    dateTime: {
        type: dateTimeSchema,
        default: dateTimeSchemaDefault
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
    bearingAccuracy: Number
})
    .index({
        expeditieId: 1,
        _id: -1
    })
    .index({
        expeditieId: 1,
        personId: 1
    })
    .index({
        personId: 1,
        'dateTime.stamp': 1
    })
    .index({
        'dateTime.stamp': 1
    })
    .index({
        expeditieId: 1,
        personId: 1,
        'dateTime.stamp': 1
    }, { unique: true });

export const geoLocationModel = mongoose.model<GeoLocationDocument>(GeoLocationId, geoLocationSchema);

export type GeoLocationOrId = DocumentOrId<GeoLocationDocument>;
