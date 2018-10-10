import * as R from 'ramda';
import { Util } from '../documents/util';
import { Person, PersonDocument, PersonModel, PersonOrID } from './model';
import { ExpeditieOrID } from '../expedities/model';

export namespace People {
    export const create = (person: Person): Promise<PersonDocument> =>
        PersonModel.create(person);

    export const getAll = (): Promise<PersonDocument[]> =>
        PersonModel.find({}).sort({ _id: 1 }).exec();

    export const getById = (id: string): Promise<PersonDocument | null> =>
        PersonModel.findById(id).exec();

    export const getByIds = (ids: string[]): Promise<PersonDocument[]> =>
        PersonModel.find({ _id: { $in: ids } }).exec();

    export const getByLdapId = (id: string): Promise<PersonDocument | null> =>
        PersonModel.findOne({ ldapId: id }).exec();

    export const addExpeditie = (person: PersonOrID, expeditie: ExpeditieOrID): Promise<PersonDocument | null> =>
        PersonModel.findByIdAndUpdate(
            Util.getObjectID(person),
            {
                $addToSet: {
                    expedities: Util.getObjectID(expeditie)
                }
            },
            { new: true }
        ).exec();

    export const addExpeditieR = R.curry(addExpeditie);

    export const removeExpeditie = (person: PersonOrID, expeditie: ExpeditieOrID): Promise<PersonDocument | null> =>
        PersonModel.findByIdAndUpdate(
            Util.getObjectID(person),
            {
                $pull: {
                    expedities: Util.getObjectID(expeditie)
                }
            },
            { new: true }
        ).exec();

    export const removeExpeditieR = R.curry(removeExpeditie);
}
