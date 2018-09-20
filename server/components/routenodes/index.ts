import { RouteEdge, RouteNode, RouteNodeDocument, RouteNodeModel, RouteNodeOrID } from './model';
import { ColorHelper } from '../../helpers/colorHelper';
import { Util } from '../documents/util';

export namespace RouteNodes {
    export const create = (node: RouteNode): Promise<RouteNodeDocument> => {
        if (node.color === undefined)
            node.color = ColorHelper.generateColorForRouteNode(node);

        return RouteNodeModel.create(node);
    };

    export const getDocument = (routenode: RouteNodeOrID): Promise<RouteNodeDocument> =>
        Util.getDocument(getById)(routenode);

    export const getDocuments = (nodes: RouteNodeOrID[]): Promise<RouteNodeDocument[]> =>
        Util.getDocuments(getByIds)(nodes);

    export const getById = (id: string): Promise<RouteNodeDocument> =>
        RouteNodeModel.findById(id).exec();

    export const getByIds = (ids: string[]): Promise<RouteNodeDocument[]> =>
        RouteNodeModel.find({ _id: { $in: ids } }).exec();

    export const populatePersons = (node: RouteNodeOrID): Promise<RouteNodeDocument> =>
        getDocument(node).then(node => node.populate('persons').execPopulate());

    export const setEdges = (edges: RouteEdge[]) => (node: RouteNodeOrID): Promise<RouteNodeDocument> =>
        RouteNodeModel.findByIdAndUpdate(
            Util.getObjectID(node),
            { edges: edges },
            { new: true }).exec();
}
