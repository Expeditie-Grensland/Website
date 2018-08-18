import { Util } from '../document/util';

import { IPerson, PersonDocument, PersonOrID, PersonSchema } from "./model";
import { ExpeditieOrID } from "../expeditie/model";

export namespace Person {
    export function createPerson(person: IPerson): Promise<PersonDocument> {
        return PersonSchema.create(person);
    }

    export function getPerson(name: string): Promise<PersonDocument> {
        return PersonSchema.findOne({ name: name }).exec();
    }

    export function getPersonById(id: string): Promise<PersonDocument> {
        return PersonSchema.findById(id).exec();
    }

    export function getPersonsByIds(ids: string[]): Promise<PersonDocument[]> {
        return PersonSchema.find({ _id: { $in: ids } }).exec();
    }

    export function addExpeditie(expeditie: ExpeditieOrID): (person: PersonOrID) => Promise<PersonDocument> {
        return person =>
            PersonSchema.findByIdAndUpdate(
                Util.getObjectID(person),
                { $push: { expedities: Util.getObjectID(expeditie) } },
                { new: true }
            ).exec();
    }

    export function removeExpeditie(expeditie: ExpeditieOrID): (person: PersonOrID) => Promise<PersonDocument> {
        return person =>
            PersonSchema.findByIdAndUpdate(
                Util.getObjectID(person),
                { $pull: { expedities: Util.getObjectID(expeditie) } },
                { new: true }
            ).exec();
    }
}
