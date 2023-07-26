import mongoose from 'mongoose';

import { DocumentOrId } from '../documents/index.js';
import { PersonId } from '../people/id.js';
import { ExpeditieId } from '../expedities/id.js';
import { EarnedPointId } from './id.js';
import { PersonOrId } from '../people/model.js';
import { DateTimeInternal, dateTimeSchema, dateTimeSchemaDefault } from '../dateTime/model.js';

const schema = new mongoose.Schema({
    dateTime: {
        type: dateTimeSchema,
        default: dateTimeSchemaDefault
    },
    amount: {
        type: Number,
        required: true
    },
    personId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: PersonId,
        required: true
    },
    expeditieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ExpeditieId
    }
});

schema.index({ 'dateTime.stamp': -1 });

export interface EarnedPoint {
    dateTime: DateTimeInternal;
    amount: number;
    personId: PersonOrId;
    expeditieId?: mongoose.Types.ObjectId;
}

export interface EarnedPointDocument extends EarnedPoint, mongoose.Document {
}

export const EarnedPointModel = mongoose.model<EarnedPointDocument>(EarnedPointId, schema);

export type EarnedPointOrId = DocumentOrId<EarnedPointDocument>;
