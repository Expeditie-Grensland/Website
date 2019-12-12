import * as mongoose from 'mongoose';

import { PersonId } from './id';
import { DocumentOrId } from '../documents';

/**
 * A Person describes a person who participates in an expeditie. They are guaranteed to have a name
 * and a list of expedities in which they participate (can be empty).
 */

const schema = new mongoose.Schema({
    name: String,
    ldapId: String,
    isAdmin: Boolean,
    team: {
        type: String,
        enum: ['Blauw', 'Rood']
    }
});

export interface Person {
    name: string;
    ldapId?: string;
    isAdmin?: boolean;
    team?: 'Blauw' | 'Rood';
}

export interface PersonDocument extends Person, mongoose.Document {
}

export const PersonModel = mongoose.model<PersonDocument>(PersonId, schema);

export type PersonOrId = DocumentOrId<PersonDocument>;
