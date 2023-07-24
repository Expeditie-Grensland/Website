import {BaseStoryElementModel, StoryElement, StoryElementDocument} from './model';
import {ExpeditieOrId} from '../expedities/model';
import { Documents } from '../documents';
import mongoose from "mongoose"

export namespace StoryElements {
    export const create = (person: StoryElement): Promise<StoryElementDocument> =>
        BaseStoryElementModel.create(person) as any;

    export const getAll = (): Promise<StoryElementDocument[]> =>
        BaseStoryElementModel.find({}).sort({ 'dateTime.stamp': 1, index: 1 }).exec() as any;

    export const getById = (id: mongoose.Types.ObjectId): Promise<StoryElementDocument | null> =>
        BaseStoryElementModel.findById(id).exec() as any;

    export const getByExpeditie = (expeditie: ExpeditieOrId): Promise<StoryElementDocument[]> =>
        BaseStoryElementModel.find({ expeditieId: Documents.getObjectId(expeditie) }).sort({ 'dateTime.stamp': 1, index: 1 }).exec() as any;

    export const getByExpeditieCount = (expeditie: ExpeditieOrId): Promise<number> =>
        BaseStoryElementModel.find({ expeditieId: Documents.getObjectId(expeditie) }).count().exec();
}
