import mongoose from "mongoose";

import { BaseStoryElementModel, StoryElement } from "./model.js";

export const createStory = async (person: StoryElement) =>
  await BaseStoryElementModel.create(person);

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
) => await BaseStoryElementModel.find({ expeditieId }).count();
