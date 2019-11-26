import * as mongoose from 'mongoose';

import { DocumentOrId } from '../documents';
import { PersonId } from '../people/id';
import { ExpeditieId } from '../expedities/id';
import { ExpeditieOrId } from '../expedities/model';
import { EarnedPointId } from './id';
import { OffsetDate, offsetDateSchema } from '../offsetDate/model';
import { PersonOrId } from '../people/model';

const schema = new mongoose.Schema({
    date: {
        type: offsetDateSchema,
        required: true
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

schema.index({ 'date.date': -1 });

export interface EarnedPoint {
    date: OffsetDate;
    amount: number;
    personId: PersonOrId;
    expeditieId?: ExpeditieOrId;
}

export interface EarnedPointDocument extends EarnedPoint, mongoose.Document {
}

export const EarnedPointModel = mongoose.model<EarnedPointDocument>(EarnedPointId, schema);

export type EarnedPointOrId = DocumentOrId<EarnedPointDocument>;
