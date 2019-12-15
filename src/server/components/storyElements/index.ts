import { StoryElement, StoryElementDocument, storyElementModel } from './model';
import { ExpeditieOrId } from '../expedities/model';
import { Documents } from '../documents';

export namespace StoryElements {
    export const create = (person: StoryElement): Promise<StoryElementDocument> =>
        storyElementModel.create(person);

    export const getAll = (): Promise<StoryElementDocument[]> =>
        storyElementModel.find({}).sort({ 'dateTime.stamp': 1, index: 1 }).exec();

    export const getByExpeditie = (expeditie: ExpeditieOrId): Promise<StoryElementDocument[]> =>
        storyElementModel.find({ expeditieId: Documents.getObjectId(expeditie) }).sort({ 'dateTime.stamp': 1, index: 1 }).exec();

    export const getByExpeditieCount = (expeditie: ExpeditieOrId): Promise<number> =>
        storyElementModel.find({ expeditieId: Documents.getObjectId(expeditie) }).count().exec();
}
