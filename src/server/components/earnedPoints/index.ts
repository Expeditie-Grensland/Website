import mongoose from "mongoose";

import { Expeditie } from "../expedities/model.js";
import { Person } from "../people/model.js";
import { EarnedPointModel } from "./model.js";

export const getById = async (id: mongoose.Types.ObjectId) =>
  await EarnedPointModel.findById(id);

export const getAll = async () =>
  await EarnedPointModel.find().sort({ "dateTime.stamp": -1 });

export const getAllPopulated = async () =>
  await EarnedPointModel.find()
    .sort({ "dateTime.stamp": -1 })
    .populate<{ personId: Pick<Person, "firstName" | "lastName" | "team"> }>(
      "personId",
      "firstName lastName team"
    )
    .populate<{ expeditieId: Pick<Expeditie, "name"> }>("expeditieId", "name");
