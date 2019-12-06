import * as mongoose from 'mongoose';
import { GeoNodeId } from './id';
import { DocumentOrId } from '../documents';
import { ExpeditieId } from '../expedities/id';
import { PersonId } from '../people/id';

export interface GeoNode {
    _id?: mongoose.Types.ObjectId;
    expeditieId: mongoose.Types.ObjectId;
    personIds: mongoose.Types.ObjectId[];
    timeFrom?: number;
    timeTill?: number;
}

export interface GeoNodeDocument extends GeoNode, mongoose.Document {
    _id: mongoose.Types.ObjectId;
    timeFrom: number;
    timeTill: number;
}

const geoNodeSchema = new mongoose.Schema({
    expeditieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ExpeditieId,
        required: true
    },
    personIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: PersonId,
        required: true
    }],
    timeFrom: {
        type: Number,
        default: 0,
        set: (t: number) => t > 1e10 ? t / 1000 : t
    },
    timeTill: {
        type: Number,
        default: Number.POSITIVE_INFINITY,
        set: (t: number) => t > 1e10 ? t / 1000 : t
    }
})
    .index({
        expeditieId: 1,
        timeTill: 1
    });

export const geoNodeModel = mongoose.model<GeoNodeDocument>(GeoNodeId, geoNodeSchema);

export type GeoNodeOrId = DocumentOrId<GeoNodeDocument>;
