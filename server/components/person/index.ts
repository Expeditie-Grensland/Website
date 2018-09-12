import { Util } from '../document/util';
import { IPerson, PersonDocument, PersonOrID, PersonSchema } from './model';
import { ExpeditieOrID } from '../expeditie/model';

export namespace Person {
    export function create(person: IPerson): Promise<PersonDocument> {
        return PersonSchema.create(person);
    }

    export function getAll(): Promise<PersonDocument[]> {
        return PersonSchema.find({}).exec();
    }

    export function getById(id: string): Promise<PersonDocument> {
        return PersonSchema.findById(id).exec();
    }

    export function getByIds(ids: string[]): Promise<PersonDocument[]> {
        return PersonSchema.find({ _id: { $in: ids } }).exec();
    }

    export function getByLdapId(id: string): Promise<PersonDocument> {
        return PersonSchema.findOne({ldapId: id}).exec();
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
