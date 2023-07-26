import mongoose, { HydratedDocument } from "mongoose";

import { Person } from "../people/model.js";
import { geoNodeModel } from "./model.js";

export const getNodesByExpeditie = async (
  expeditieId: mongoose.Types.ObjectId
) => await geoNodeModel.find({ expeditieId }).sort({ _id: 1 });

export const getPopulatedNodesByExpeditie = async (
  expeditieId: mongoose.Types.ObjectId
) =>
  await geoNodeModel
    .find({ expeditieId })
    .sort({ _id: 1 })
    .populate<{ personIds: HydratedDocument<Person>[] }>("personIds");
