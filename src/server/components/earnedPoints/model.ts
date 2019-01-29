import * as mongoose from 'mongoose';
import { DocumentOrId } from '../documents/new';
import { PersonId } from '../people/id';
import { ExpeditieId } from '../expedities/id';
import { EarnedPointId } from './id';
import { PersonDocument } from '../people/model';
import { ExpeditieDocument } from '../expedities/model';
import { OffsetDate, offsetDateSchema } from '../offsetDate/model';

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
    },
});

export interface EarnedPoint {
    date: OffsetDate;
    amount: number;
    personId: DocumentOrId<PersonDocument>;
    expeditieId?: DocumentOrId<ExpeditieDocument>;
}

export interface EarnedPointDocument extends EarnedPoint, mongoose.Document {
}

export const EarnedPointModel = mongoose.model<EarnedPointDocument>(EarnedPointId, schema);

export type EarnedPointOrId = DocumentOrId<EarnedPointDocument>;
