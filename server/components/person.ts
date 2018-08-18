import { Tables } from '../models/tables';
import { Util } from '../models/util';

import PersonDocument = Tables.Person.PersonDocument;

export namespace Person {
    import Person = Tables.Person.Person;
    import ExpeditieOrID = Tables.ExpeditieOrID;
    import PersonOrID = Tables.PersonOrID;

    export function createPerson(person: Person): Promise<PersonDocument> {
        return Tables.Person.PersonSchema.create(person);
    }

    export function getPerson(name: string): Promise<PersonDocument> {
        return Tables.Person.PersonSchema.findOne({ name: name }).exec();
    }

    export function getPersonById(id: string): Promise<PersonDocument> {
        return Tables.Person.PersonSchema.findById(id).exec();
    }

    export function getPersonsByIds(ids: string[]): Promise<PersonDocument[]> {
        return Tables.Person.PersonSchema.find({ _id: { $in: ids } }).exec();
    }

    export function addExpeditie(expeditie: ExpeditieOrID): (person: PersonOrID) => Promise<PersonDocument> {
        return person =>
            Tables.Person.PersonSchema.findByIdAndUpdate(
                Util.getObjectID(person),
                { $push: { expedities: Util.getObjectID(expeditie) } },
                { new: true }
            ).exec();
    }

    export function removeExpeditie(expeditie: ExpeditieOrID): (person: PersonOrID) => Promise<PersonDocument> {
        return person =>
            Tables.Person.PersonSchema.findByIdAndUpdate(
                Util.getObjectID(person),
                { $pull: { expedities: Util.getObjectID(expeditie) } },
                { new: true }
            ).exec();
    }
}
