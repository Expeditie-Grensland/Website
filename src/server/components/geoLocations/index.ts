import * as mongoose from 'mongoose';

import { GeoLocation, GeoLocationDocument, geoLocationModel, GeoLocationOrId } from './model';
import { Documents } from '../documents';

export namespace GeoLocations {
    export const getById = (id: mongoose.Types.ObjectId): Promise<GeoLocationDocument | null> =>
        geoLocationModel.findById(id).exec();

    export const getByIds = (ids: mongoose.Types.ObjectId[]): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({ _id: { $in: ids } }).exec();

    export const getAll = (): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({}).sort({ _id: 1 }).exec();

    export const getDocument: (loc: GeoLocationOrId) => Promise<GeoLocationDocument | null> = Documents.getDocument(getById);

    export const getDocuments: (locs: GeoLocationOrId[]) => Promise<GeoLocationDocument[]> = Documents.getDocuments(getByIds);

    export const create: ((loc: GeoLocation) => Promise<GeoLocationDocument>) = geoLocationModel.create;

    export const createMany = (locs: GeoLocation[]): Promise<GeoLocationDocument[]> =>
        geoLocationModel.insertMany(locs, { ordered: false });
}
