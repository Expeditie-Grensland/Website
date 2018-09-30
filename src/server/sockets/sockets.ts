import * as socketio from 'socket.io';

import { Expedities } from '../components/expedities';
import { Routes } from '../components/routes';
import { SocketIds } from './ids';
import { Documents } from '../components/documents/new';
import { RouteNodeDocument } from '../components/routeNodes/model';
import { Util } from '../components/documents/util';
import { SocketTypes } from './types';
import { LocationDocument, LocationModel } from '../components/locations/model';
import { RouteNodes } from '../components/routeNodes';

export namespace Sockets {
    export const getExpeditie = (socket: socketio.Socket) => (expeditieName: string): Promise<void> =>
        Expedities.getByNameShort(expeditieName)
            .then(Documents.ensureNotNull)
            .then(Expedities.getRoute)
            .then(Routes.getNodes)
            .then(_sendEverything(socket));

    const _sendEverything = (socket: socketio.Socket) => async (nodes: RouteNodeDocument[]): Promise<void> => {
        const sInfo = (await _sendInfo(socket, nodes));
        console.log(sInfo);
        const sNodes = sInfo.nodes;
        const nodesMap: Map<string, number> = new Map(sNodes.map(n => <[string, number]>[n._id, n.id]));
        await _sendLocations(socket, nodes, nodesMap)();
        socket.emit(SocketIds.DONE);
    };

    const _sendInfo = (socket: socketio.Socket, nodes: RouteNodeDocument[]): Promise<SocketTypes.Info> => {
        const sNodes = RouteNodes.getSocketNodes(nodes);
        return Routes.getBoundingBox(nodes).then(sBox => {
            let sInfo = <SocketTypes.Info>{
                nodes: sNodes,
                box: sBox
            };
            socket.emit(SocketIds.INFO, sInfo);
            return sInfo;
        });
    };

    const _getLocations = (nodes: RouteNodeDocument[], nodesMap: Map<string, number>, skip: number, limit: number): Promise<SocketTypes.Location[]> => {
        let i = skip;
        return LocationModel.find({ node: { $in: Util.getObjectIDs(nodes) } }).select({ node: 1, timestamp: 1, lat: 1, lon: 1 })
            .sort({ visualArea: 'desc' }).skip(skip).limit(limit).exec()
            .then(locations => locations.map((location: LocationDocument) => {
                return <SocketTypes.Location>[
                    i++,
                    nodesMap.get(Util.getObjectID(location.node!)),
                    location.timestamp,
                    location.lat,
                    location.lon
                ];
            }));
    };

    const _sendLocations = (socket: socketio.Socket, nodes: RouteNodeDocument[], nodesMap: Map<string, number>) => {
        const _sendBatchAndRecurse = (batchN = 0): Promise<any> => {
            if (!socket.connected) return Promise.resolve();

            let skip = 100 * (2 ** batchN - 1);
            let count = 100 * 2 ** batchN;

            return _getLocations(nodes, nodesMap, skip, count)
                .then(batch => {
                    socket.emit(SocketIds.LOCATIONS, ++batchN, batch);
                    if (batch.length == count)
                        return _sendBatchAndRecurse(batchN);
                })
                .catch(() => {
                    return;
                });
        };
        return _sendBatchAndRecurse;
    };
}
