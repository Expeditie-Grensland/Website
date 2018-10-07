import { RouteEdge, RouteNode, RouteNodeDocument, RouteNodeModel, RouteNodeOrID } from './model';
import { Util } from '../documents/util';
import { LocationDocument, LocationModel } from '../locations/model';
import { SocketTypes } from '../../sockets/types';
import * as mongoose from 'mongoose';

export namespace RouteNodes {
    export const create = (node: RouteNode): Promise<RouteNodeDocument> =>
        RouteNodeModel.create(node);

    export const getAll = (): Promise<RouteNodeDocument[]> =>
        RouteNodeModel.find({}).exec();

    export const getDocument = (routenode: RouteNodeOrID): Promise<RouteNodeDocument | null> =>
        Util.getDocument(getById)(routenode);

    export const getDocuments = (nodes: RouteNodeOrID[]): Promise<RouteNodeDocument[]> =>
        Util.getDocuments(getByIds)(nodes);

    export const getById = (id: string): Promise<RouteNodeDocument | null> =>
        RouteNodeModel.findById(id).exec();

    export const getByIds = (ids: string[]): Promise<RouteNodeDocument[]> =>
        RouteNodeModel.find({ _id: { $in: ids } }).exec();

    export const setEdges = (node: RouteNodeOrID, edges: RouteEdge[]): Promise<RouteNodeDocument | null> =>
        RouteNodeModel.findByIdAndUpdate(
            Util.getObjectID(node),
            { edges: edges },
            { new: true }).exec();

    export const getLocationsSortedByTimestampDescending = (node: RouteNodeOrID, skip: number, limit: number): Promise<LocationDocument[]> =>
        LocationModel.find({ node: Util.getObjectID(node) })
            .sort({ timestamp: 'desc' })
            .skip(skip)
            .limit(limit)
            .exec();

    export const getSocketNodes = (nodes: RouteNodeDocument[]): SocketTypes.RouteNode[] => {
        let i = 0;
        return nodes.map(node => {
            return <SocketTypes.RouteNode>{
                id: i++,
                _id: mongoose.Types.ObjectId(node._id).toHexString(),
                color: '#000'
            };
        });
    };
}
