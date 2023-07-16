import * as mongoose from 'mongoose';

import { GeoNode, GeoNodeDocument, geoNodeModel, GeoNodeOrId } from './model';
import { Documents } from '../documents';

export namespace GeoNodes {
    export const getById = (id: mongoose.Types.ObjectId): Promise<GeoNodeDocument | null> =>
        geoNodeModel.findById(id).exec();

    export const getByIds = (ids: mongoose.Types.ObjectId[]): Promise<GeoNodeDocument[]> =>
        geoNodeModel.find({ _id: { $in: ids } }).exec();

    export const getAll = (): Promise<GeoNodeDocument[]> =>
        geoNodeModel.find({}).sort({ _id: 1 }).exec();

    export const getDocument: (node: GeoNodeOrId) => Promise<GeoNodeDocument | null> = Documents.getDocument(getById);

    export const getDocuments: (nodes: GeoNodeOrId[]) => Promise<GeoNodeDocument[]> = Documents.getDocuments(getByIds);

    export const create = async (node: GeoNode): Promise<GeoNodeDocument> =>
        geoNodeModel.create(node);

    export const createMany = async (nodes: GeoNode[]): Promise<GeoNodeDocument[]> => // @ts-ignore
        geoNodeModel.insertMany(nodes);
}
