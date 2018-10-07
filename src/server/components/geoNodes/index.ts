import { GeoNode, GeoNodeDocument, geoNodeModel, GeoNodeOrId } from './model';
import * as mongoose from 'mongoose';
import { Documents } from '../documents/new';
import { ExpeditieModel } from '../expedities/model';

export namespace GeoNodes {
    export const getById = (id: mongoose.Types.ObjectId): Promise<GeoNodeDocument | null> =>
        geoNodeModel.findById(id).exec();

    export const getByIds = (ids: mongoose.Types.ObjectId[]): Promise<GeoNodeDocument[]> =>
        geoNodeModel.find({ _id: { $in: ids } }).exec();

    export const getAll = (): Promise<GeoNodeDocument[]> =>
        geoNodeModel.find({}).exec();

    export const getDocument: (node: GeoNodeOrId) => Promise<GeoNodeDocument | null> = Documents.getDocument(getById);

    export const getDocuments: (nodes: GeoNodeOrId[]) => Promise<GeoNodeDocument[]> = Documents.getDocuments(getByIds);

    export const create = async (node: GeoNode): Promise<GeoNodeDocument> => {
        node._id = node._id || mongoose.Types.ObjectId();

        await ExpeditieModel.findByIdAndUpdate(
            Documents.getObjectId(node.expeditieId),
            {
                $addToSet: {
                    nodes: node._id
                }
            });

        return geoNodeModel.create(node);
    }
}
