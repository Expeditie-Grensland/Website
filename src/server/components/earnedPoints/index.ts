import { EarnedPoint, EarnedPointDocument, EarnedPointModel } from './model.js';
import mongoose from 'mongoose';

export const getById = (id: mongoose.Types.ObjectId): Promise<EarnedPointDocument | null> =>
    EarnedPointModel.findById(id).exec();

export const create = (earnedPoint: EarnedPoint): Promise<EarnedPointDocument> =>
    EarnedPointModel.create(earnedPoint);

export const getAll = (): Promise<EarnedPointDocument[]> =>
    EarnedPointModel.find().sort({ 'dateTime.stamp': -1 }).exec();

export const getAllPopulated = (): Promise<EarnedPointDocument[]> =>
    EarnedPointModel.find().sort({ 'dateTime.stamp': -1 })
        .populate('personId', 'firstName lastName team')
        .populate('expeditieId', 'name')
        .exec();
