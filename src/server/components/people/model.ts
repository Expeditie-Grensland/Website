import * as mongoose from 'mongoose';

import { PersonId } from './id';
import { DocumentOrId } from '../documents';

/**
 * A Person describes a person who participates in an expeditie. They are guaranteed to have a name
 * and a list of expedities in which they participate (can be empty).
 */

const schema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    initials: String,
    userName: String,
    ldapId: String,
    isAdmin: Boolean,
    team: {
        type: String,
        enum: ['Blauw', 'Rood']
    }
});

schema.index({ lastName: 1, firstName: 1 });
schema.index({ userName: 1 });

export interface Person {
    firstName: string;
    lastName: string;
    initials: string;
    userName: string;
    ldapId?: string;
    isAdmin?: boolean;
    team?: 'Blauw' | 'Rood';
}

export interface PersonDocument extends Person, mongoose.Document {
}

export const PersonModel = mongoose.model<PersonDocument>(PersonId, schema);

export type PersonOrId = DocumentOrId<PersonDocument>;
