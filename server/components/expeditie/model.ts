import * as mongoose from 'mongoose';
import { DocumentOrID, reference } from '../document/util';
import { RouteID, RouteOrID } from '../route/model';
import { PersonID, PersonOrID } from '../person/model';

export const ExpeditieID = 'Expeditie';

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
    background: {
        imageUrl: String,
        position: {
            x: Number,
            y: Number
        }
    },
    showMap: Boolean,
    mapUrl: String,
    movieUrl: String,
    movieCoverUrl: String,
    finished: Boolean,
    participants: [reference(PersonID)],
    route: reference(RouteID),
    countries: [String]
});

export interface IExpeditie {
    sequenceNumber: number;
    name: string;
    nameShort: string;
    subtitle: string;
    color: string;
    background: {
        imageUrl: string;
        position: {
            x: number;
            y: number;
        };
    };
    showMap: boolean;
    mapUrl?: string;
    movieUrl: string;
    movieCoverUrl: string;
    finished?: boolean;
    participants: PersonOrID[];
    route?: RouteOrID;
    countries: string[];
}

export interface ExpeditieDocument extends IExpeditie, mongoose.Document {}

export const ExpeditieSchema = mongoose.model<ExpeditieDocument>(ExpeditieID, schema);

export type ExpeditieOrID = DocumentOrID<ExpeditieDocument>;
