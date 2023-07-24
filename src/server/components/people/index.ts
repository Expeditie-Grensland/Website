import * as mongoose from 'mongoose';

import { Person, PersonDocument, PersonModel, PersonOrId } from './model';
import * as Documents from '../documents';

export const create = (person: Person): Promise<PersonDocument> =>
    PersonModel.create(person);

export const getAll = (): Promise<PersonDocument[]> =>
    PersonModel.find({}).sort({ lastName: 1 }).exec();

export const getById = (id: mongoose.Types.ObjectId): Promise<PersonDocument | null> =>
    PersonModel.findById(id).exec();

export const getByIds = (ids: mongoose.Types.ObjectId[]): Promise<PersonDocument[]> =>
    PersonModel.find({ _id: { $in: ids } }).exec();

export const getDocument = (person: PersonOrId): Promise<PersonDocument | null> =>
    Documents.getDocument(getById)(person);

export const getDocuments = (persons: PersonOrId[]): Promise<PersonDocument[]> =>
    Documents.getDocuments(getByIds)(persons);

export const getByFirstLastName = (firstName: string, lastName: string): Promise<PersonDocument | null> =>
    PersonModel.findOne({ firstName, lastName }).exec();

export const getByUserName = (userName: string): Promise<PersonDocument | null> =>
    PersonModel.findOne({ userName }).exec();

export const getByLdapId = (id: string): Promise<PersonDocument | null> =>
    PersonModel.findOne({ ldapId: id }).exec();

export const setIsAdmin = (person: PersonOrId, isAdmin: boolean): Promise<PersonDocument | null> =>
    PersonModel.findByIdAndUpdate(Documents.getObjectId(person), { isAdmin }, { new: true }).exec();
