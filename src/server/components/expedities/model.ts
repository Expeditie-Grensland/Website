import * as mongoose from 'mongoose';

import { PersonId } from '../people/id';
import { PersonOrId } from '../people/model';
import { MediaFileEmbedded, mediaFileEmbeddedSchema } from '../mediaFiles/model';
import { ExpeditieId } from './id';
import { DocumentOrId } from '../documents';

/**
 * The expeditie is the wrapping object for all data related to one trip. This is represented on the home page by
 * one column.
 */

const schema = new mongoose.Schema({
    sequenceNumber: Number,
    name: String,
    nameShort: String,
    subtitle: String,
    showMap: Boolean,
    finished: { type: Boolean, default: false },
    personIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: PersonId
    }],
    countries: [String],
    backgroundFile: mediaFileEmbeddedSchema,
    showMovie: Boolean,
    movieRestricted: Boolean,
    movieEditorIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: PersonId
    }]
});

schema.index({ nameShort: 1 });
schema.index({ sequenceNumber: -1 });

export interface Expeditie {
    sequenceNumber: number;
    name: string;
    nameShort: string;
    subtitle: string;
    showMap: boolean;
    finished?: boolean;
    personIds: PersonOrId[];
    countries: string[];
    backgroundFile: MediaFileEmbedded;
    showMovie: boolean;
    movieRestricted: boolean;
    movieEditorIds: PersonOrId[];
}

export interface ExpeditieDocument extends Expeditie, mongoose.Document {
}

export const ExpeditieModel = mongoose.model<ExpeditieDocument>(ExpeditieId, schema);

export type ExpeditieOrId = DocumentOrId<ExpeditieDocument>;
