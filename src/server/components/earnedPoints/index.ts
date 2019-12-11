import { EarnedPoint, EarnedPointDocument, EarnedPointModel } from './model';

export namespace EarnedPoints {
    export const create = (earnedPoint: EarnedPoint): Promise<EarnedPointDocument> =>
        EarnedPointModel.create(earnedPoint);

    export const getAll = (): Promise<EarnedPointDocument[]> =>
        EarnedPointModel.find().sort({ 'date.date': -1 }).exec();

    export const getAllPopulated = (): Promise<EarnedPointDocument[]> =>
        EarnedPointModel.find().sort({ 'date.date': -1 })
            .populate('personId', 'name nameShort team')
            .populate('expeditieId', 'name')
            .exec();
}
