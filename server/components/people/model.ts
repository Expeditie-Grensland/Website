import * as mongoose from 'mongoose';
import { DocumentOrID, reference } from '../documents/util';
import { ExpeditieID, ExpeditieOrID } from "../expedities/model";

export const PersonID = 'Person';

/**
 * A Person describes a person who participates in an expeditie. They are guaranteed to have a name
 * and a list of expedities in which they participate (can be empty).
 */

const schema = new mongoose.Schema({
    email: String,
    name: String,
    expedities: [reference(ExpeditieID)],
    language: String,
    ldapId: String
});

export interface Person {
    email?: string;
    name: string;
    expedities?: ExpeditieOrID[];
    language?: string;
    ldapId?: string;
}

export interface PersonDocument extends Person, mongoose.Document {}

export const PersonModel = mongoose.model<PersonDocument>(PersonID, schema);

export type PersonOrID = DocumentOrID<PersonDocument>;
