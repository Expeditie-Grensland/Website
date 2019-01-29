import { EarnedPoint, EarnedPointDocument, EarnedPointModel } from './model';

export namespace EarnedPoints {
    export const create = (earnedPoint: EarnedPoint): Promise<EarnedPointDocument> =>
        EarnedPointModel.create(earnedPoint);
}
