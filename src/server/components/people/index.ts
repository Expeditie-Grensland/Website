import * as mongoose from 'mongoose';

import { Person, PersonDocument, PersonModel } from './model';

export namespace People {
    export const create = (person: Person): Promise<PersonDocument> =>
        PersonModel.create(person);

    export const getAll = (): Promise<PersonDocument[]> =>
        PersonModel.find({}).sort({ _id: 1 }).exec();

    export const getById = (id: mongoose.Types.ObjectId): Promise<PersonDocument | null> =>
        PersonModel.findById(id).exec();

    export const getByName = (name: string): Promise<PersonDocument | null> =>
        PersonModel.findOne({ name }).exec();

    export const getByLdapId = (id: string): Promise<PersonDocument | null> =>
        PersonModel.findOne({ ldapId: id }).exec();
}
