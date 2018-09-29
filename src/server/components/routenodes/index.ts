import { RouteEdge, RouteNode, RouteNodeDocument, RouteNodeModel, RouteNodeOrID } from './model';
import { ColorHelper } from '../../helpers/colorHelper';
import { Util } from '../documents/util';
import { Documents } from '../documents/new';
import { LocationDocument, LocationModel } from '../locations/model';

export namespace RouteNodes {
    export const create = (node: RouteNode): Promise<RouteNodeDocument> => {
        if (node.color === undefined)
            node.color = ColorHelper.generateColorForRouteNode(node);

        return RouteNodeModel.create(node);
    };

    export const getDocument = (routenode: RouteNodeOrID): Promise<RouteNodeDocument | null> =>
        Util.getDocument(getById)(routenode);

    export const getDocuments = (nodes: RouteNodeOrID[]): Promise<RouteNodeDocument[]> =>
        Util.getDocuments(getByIds)(nodes);

    export const getById = (id: string): Promise<RouteNodeDocument | null> =>
        RouteNodeModel.findById(id).exec();

    export const getByIds = (ids: string[]): Promise<RouteNodeDocument[]> =>
        RouteNodeModel.find({ _id: { $in: ids } }).exec();

    // TODO: Ensure not null
    export const populatePersons = (node: RouteNodeOrID): Promise<RouteNodeDocument> =>
        getDocument(node)
            .then(Documents.ensureNotNull)
            .then(node => node.populate('persons').execPopulate());

    export const setEdges = (edges: RouteEdge[]) => (node: RouteNodeOrID): Promise<RouteNodeDocument | null> =>
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
}
