import * as mongoose from 'mongoose';
import { GeoNodeId } from './id';
import { DocumentOrId } from '../documents/new';
import { ExpeditieId } from '../expedities/id';
import { PersonId } from '../people/id';

export interface GeoNode {
    _id?: mongoose.Types.ObjectId;
    expeditieId: mongoose.Types.ObjectId;
    timeFrom: number;
    timeTill: number;
    peopleIds: mongoose.Types.ObjectId[];
}

export interface GeoNodeDocument extends GeoNode, mongoose.Document {
    _id: mongoose.Types.ObjectId;
}

const geoNodeSchema = new mongoose.Schema({
    expeditieId: { type: mongoose.Schema.Types.ObjectId, ref: ExpeditieId },
    timeFrom: { type: Number, default: 0 },
    timeTill: Number,
    peopleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: PersonId }]
});

export const geoNodeModel = mongoose.model<GeoNodeDocument>(GeoNodeId, geoNodeSchema);

export type GeoNodeOrId = DocumentOrId<GeoNodeDocument>;
