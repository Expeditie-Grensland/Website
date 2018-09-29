import * as mongoose from 'mongoose';
import { DocumentOrID, reference } from '../documents/util';
import { RouteOrID } from '../routes/model';
import { PersonOrID } from '../people/model';
import { MediaFileEmbedded, mediaFileEmbeddedSchema } from '../mediaFiles/model';
import { ExpeditieId } from './id';
import { PersonId } from '../people/id';
import { RouteId } from '../routes/id';

/**
 * The expeditie is the wrapping object for all data related to one trip. This is represented on the home page by
 * one column.
 */

const schema = new mongoose.Schema({
    sequenceNumber: Number,
    name: String,
    nameShort: String,
    subtitle: String,
    color: String,
    showMap: Boolean,
    movieUrl: String,
    finished: { type: Boolean, default: false },
    participants: [reference(PersonId)],
    route: reference(RouteId),
    countries: [String],
    backgroundFile: mediaFileEmbeddedSchema,
    movieCoverFile: mediaFileEmbeddedSchema
});

schema.index({ nameShort: 1 });
schema.index({ sequenceNumber: -1 });

export interface Expeditie {
    sequenceNumber: number;
    name: string;
    nameShort: string;
    subtitle: string;
    color: string;
    showMap: boolean;
    movieUrl: string;
    finished?: boolean;
    participants: PersonOrID[];
    route?: RouteOrID;
    countries: string[];
    backgroundFile: MediaFileEmbedded;
    movieCoverFile: MediaFileEmbedded;
}

export interface ExpeditieDocument extends Expeditie, mongoose.Document {
}

export const ExpeditieModel = mongoose.model<ExpeditieDocument>(ExpeditieId, schema);

export type ExpeditieOrID = DocumentOrID<ExpeditieDocument>;
