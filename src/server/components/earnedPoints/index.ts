import { Expeditie } from '../expedities/model.js';
import { Person } from '../people/model.js';
import { EarnedPointDocument, EarnedPointModel } from './model.js';
import mongoose from 'mongoose';

export const getById = (id: mongoose.Types.ObjectId): Promise<EarnedPointDocument | null> =>
    EarnedPointModel.findById(id).exec();

export const getAll = (): Promise<EarnedPointDocument[]> =>
    EarnedPointModel.find().sort({ 'dateTime.stamp': -1 }).exec();

export const getAllPopulated = () =>
    EarnedPointModel.find().sort({ 'dateTime.stamp': -1 })
        .populate<{ personId: Person }>('personId', 'firstName lastName team')
        .populate<{ expeditieId: Expeditie }>('expeditieId', 'name')
        .exec();
