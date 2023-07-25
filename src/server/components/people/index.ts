import mongoose from "mongoose";

import { PersonDocument, PersonModel } from "./model.js";

export const getAll = (): Promise<PersonDocument[]> =>
  PersonModel.find({}).sort({ lastName: 1 }).exec();

export const getById = (
  id: mongoose.Types.ObjectId
): Promise<PersonDocument | null> => PersonModel.findById(id).exec();

export const getByUserName = (
  userName: string
): Promise<PersonDocument | null> => PersonModel.findOne({ userName }).exec();

export const getByLdapId = (id: string): Promise<PersonDocument | null> =>
  PersonModel.findOne({ ldapId: id }).exec();
