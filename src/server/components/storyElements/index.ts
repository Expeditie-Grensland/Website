import mongoose from "mongoose";

import { BaseStoryElementModel, StoryElement } from "./model.js";

export const create = async (person: StoryElement) =>
  await BaseStoryElementModel.create(person);

export const getAll = async () =>
  await BaseStoryElementModel.find({}).sort({ "dateTime.stamp": 1, index: 1 });

export const getById = async (id: mongoose.Types.ObjectId) =>
  await BaseStoryElementModel.findById(id);

export const getByExpeditie = async (expeditieId: mongoose.Types.ObjectId) =>
  await BaseStoryElementModel.find({ expeditieId }).sort({
    "dateTime.stamp": 1,
    index: 1,
  });

export const getCountByExpeditie = async (
  expeditieId: mongoose.Types.ObjectId
) => await BaseStoryElementModel.find({ expeditieId }).count();
