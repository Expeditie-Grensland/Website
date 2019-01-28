import * as mongoose from 'mongoose';
import { DocumentOrID, reference } from '../documents/util';
import { ExpeditieOrID } from '../expedities/model';
import { ExpeditieId } from '../expedities/id';
import { PersonId } from './id';

/**
 * A Person describes a person who participates in an expeditie. They are guaranteed to have a name
 * and a list of expedities in which they participate (can be empty).
 */

const schema = new mongoose.Schema({
    name: String,
    expedities: [reference(ExpeditieId)],
    ldapId: String,
    team: {
        type: String,
        enum: ['Blauw', 'Rood']
    }
});

export interface Person {
    name: string;
    expedities?: ExpeditieOrID[];
    ldapId?: string;
    team?: 'Blauw' | 'Rood';
}

export interface PersonDocument extends Person, mongoose.Document {}

export const PersonModel = mongoose.model<PersonDocument>(PersonId, schema);

export type PersonOrID = DocumentOrID<PersonDocument>;
