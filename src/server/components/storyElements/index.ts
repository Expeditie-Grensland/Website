import mongoose from "mongoose";

import { BaseStoryElementModel } from "./model.js";

export const getAllStories = async () =>
  await BaseStoryElementModel.find({}).sort({ "dateTime.stamp": 1, index: 1 });

export const getStoryById = async (id: mongoose.Types.ObjectId) =>
  await BaseStoryElementModel.findById(id);

export const getStoryByExpeditie = async (
  expeditieId: mongoose.Types.ObjectId
) =>
  await BaseStoryElementModel.find({ expeditieId }).sort({
    "dateTime.stamp": 1,
    index: 1,
  });

export const getStoryCountByExpeditie = async (
  expeditieId: mongoose.Types.ObjectId
) => await BaseStoryElementModel.find({ expeditieId }).countDocuments();
