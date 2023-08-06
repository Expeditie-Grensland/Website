import mongoose from "mongoose";

import { PersonModel } from "./model.js";

export const getAllPeople = async () =>
  await PersonModel.find({}).sort({ sortingName: 1 });

export const getPersonById = async (id: mongoose.Types.ObjectId) =>
  await PersonModel.findById(id);

export const getPersonByUserName = async (userName: string) =>
  await PersonModel.findOne({ userName });

export const getPersonByLdapId = async (id: string) =>
  await PersonModel.findOne({ ldapId: id });
