import * as mongoose from 'mongoose';

export interface OffsetDate {
    date: Date;
    offset: number;
}

export const offsetDateSchema = new mongoose.Schema({
    date: Date,
    offset: Number
}, { _id: false });
