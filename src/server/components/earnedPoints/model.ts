import * as mongoose from 'mongoose';

import { DocumentOrId } from '../documents';
import { PersonId } from '../people/id';
import { ExpeditieId } from '../expedities/id';
import { ExpeditieOrId } from '../expedities/model';
import { EarnedPointId } from './id';
import { PersonOrId } from '../people/model';
import { DateTimeInternal, dateTimeSchema } from '../dateTime/model';

const schema = new mongoose.Schema({
    dateTime: {
        type: dateTimeSchema,
        default: dateTimeSchema
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
    expeditieId?: ExpeditieOrId;
}

export interface EarnedPointDocument extends EarnedPoint, mongoose.Document {
}

export const EarnedPointModel = mongoose.model<EarnedPointDocument>(EarnedPointId, schema);

export type EarnedPointOrId = DocumentOrId<EarnedPointDocument>;
