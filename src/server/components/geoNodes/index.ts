import { GeoNode, GeoNodeDocument, geoNodeModel, GeoNodeOrId } from './model';
import * as mongoose from 'mongoose';
import { Documents } from '../documents/new';
import { ExpeditieDocument, ExpeditieModel } from '../expedities/model';
import { RouteNodes } from '../routeNodes';
import { Expedities } from '../expedities';
import { RouteNodeDocument } from '../routeNodes/model';

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
    };

    export const transferRouteNodes = async () => {
        const routeNodes: RouteNodeDocument[] = await RouteNodes.getAll();
        const expedities: ExpeditieDocument[] = await Expedities.getAll();

        const geoNodes: GeoNode[] = [];

        for (let n of routeNodes) {
            const id = n._id;
            const expeditieId = expedities.find(e => e.route == n.route)!._id;

            const locations = await RouteNodes.getLocationsSortedByTimestampDescending(n, 0, 1e10);

            const newNode: GeoNode = {
                _id: id,
                expeditieId,
                // @ts-ignore
                personIds: n.persons.map(mongoose.Types.ObjectId),
                timeFrom: locations[locations.length - 1].timestamp,
                timeTill: locations[0].timestamp
            };

            geoNodes.push(newNode);
        }

        geoNodeModel.insertMany(geoNodes);
    };
}
