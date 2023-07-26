import {BaseStoryElementModel, StoryElement, StoryElementDocument} from './model.js';
import mongoose from "mongoose"

export const create = (person: StoryElement): Promise<StoryElementDocument> =>
    BaseStoryElementModel.create(person) as any;

export const getAll = (): Promise<StoryElementDocument[]> =>
    BaseStoryElementModel.find({}).sort({ 'dateTime.stamp': 1, index: 1 }).exec() as any;

export const getById = (id: mongoose.Types.ObjectId): Promise<StoryElementDocument | null> =>
    BaseStoryElementModel.findById(id).exec() as any;

export const getByExpeditie = (expeditieId: mongoose.Types.ObjectId): Promise<StoryElementDocument[]> =>
    BaseStoryElementModel.find({ expeditieId }).sort({ 'dateTime.stamp': 1, index: 1 }).exec() as any;

export const getCountByExpeditie = (expeditieId: mongoose.Types.ObjectId): Promise<number> =>
    BaseStoryElementModel.find({ expeditieId }).count().exec();
