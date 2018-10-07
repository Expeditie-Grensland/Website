import { GeoLocation, GeoLocationDocument, geoLocationModel, GeoLocationOrId } from './model';
import * as mongoose from 'mongoose';
import { Documents } from '../documents/new';

export namespace GeoLocations {
    export const getById = (id: mongoose.Types.ObjectId): Promise<GeoLocationDocument | null> =>
        geoLocationModel.findById(id).exec();

    export const getByIds = (ids: mongoose.Types.ObjectId[]): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({ _id: { $in: ids } }).exec();

    export const getAll = (): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({}).exec();

    export const getDocument: (loc: GeoLocationOrId) => Promise<GeoLocationDocument | null> = Documents.getDocument(getById);

    export const getDocuments: (locs: GeoLocationOrId[]) => Promise<GeoLocationDocument[]> = Documents.getDocuments(getByIds);

    export const create = (loc: GeoLocation): Promise<GeoLocationDocument> =>
        geoLocationModel.create(loc);
}
