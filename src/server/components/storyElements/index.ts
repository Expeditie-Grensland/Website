import {BaseStoryElementModel, StoryElement, StoryElementDocument} from './model';
import {ExpeditieDocument, ExpeditieModel, ExpeditieOrId} from '../expedities/model';
import { Documents } from '../documents';
import mongoose from "mongoose"

export namespace StoryElements {
    export const create = (person: StoryElement): Promise<StoryElementDocument> =>
        BaseStoryElementModel.create(person);

    export const getAll = (): Promise<StoryElementDocument[]> =>
        BaseStoryElementModel.find({}).sort({ 'dateTime.stamp': 1, index: 1 }).exec();

    export const getById = (id: mongoose.Types.ObjectId): Promise<StoryElementDocument | null> =>
        BaseStoryElementModel.findById(id).exec();

    export const getByExpeditie = (expeditie: ExpeditieOrId): Promise<StoryElementDocument[]> =>
        BaseStoryElementModel.find({ expeditieId: Documents.getObjectId(expeditie) }).sort({ 'dateTime.stamp': 1, index: 1 }).exec();

    export const getByExpeditieCount = (expeditie: ExpeditieOrId): Promise<number> =>
        BaseStoryElementModel.find({ expeditieId: Documents.getObjectId(expeditie) }).count().exec();
}
