import mongoose from "mongoose";

import { Person } from "../people/model.js";
import { ExpeditieModel } from "./model.js";

export const getPopulatedExpeditieByName = async (nameShort: string) =>
  await ExpeditieModel.findOne({ nameShort })
    .populate<{ personIds: Person[] }>({
      path: "personIds",
      options: { sort: { sortingName: 1 } },
    })
    .populate<{ movieEditorIds: Person[] }>({
      path: "movieEditorIds",
      options: { sort: { sortingName: 1 } },
    });

export const getAllExpedities = async () =>
  await ExpeditieModel.find({}).sort({ sequenceNumber: -1 });

export const getExpeditieById = async (id: mongoose.Types.ObjectId) =>
  await ExpeditieModel.findById(id);
