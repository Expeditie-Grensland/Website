import mongoose from "mongoose";

import { PersonModel } from "./model.js";

export const getAll = async () =>
  await PersonModel.find({}).sort({ lastName: 1 });

export const getById = async (id: mongoose.Types.ObjectId) =>
  await PersonModel.findById(id);

export const getByUserName = async (userName: string) =>
  await PersonModel.findOne({ userName });

export const getByLdapId = async (id: string) =>
  await PersonModel.findOne({ ldapId: id });
