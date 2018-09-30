import * as socketio from 'socket.io';

import { Expedities } from '../components/expedities';
import { Routes } from '../components/routes';
import { SocketIds } from './ids';
import { Documents } from '../components/documents/new';
import { RouteNodeDocument } from '../components/routeNodes/model';
import { Util } from '../components/documents/util';
import { SocketTypes } from './types';
import { LocationModel } from '../components/locations/model';

export namespace Sockets {
    const _emit = (socket: socketio.Socket, id: string): ((...args: any[]) => void) =>
        (...args) => socket.emit(id, ...args);

    export const getExpeditie = (socket: socketio.Socket) => (expeditieName: string) =>
        Expedities.getByNameShort(expeditieName)
            .then(Documents.ensureNotNull)
            .then(Expedities.getRoute)
            .then(Routes.getNodes)
            .then(nodes => Promise.all([
                _getNodes(nodes).then(_emit(socket, SocketIds.NODES)),
                _getBoundingBox(nodes).then(_emit(socket, SocketIds.BOUNDINGBOX)),
                _sendLocations(socket)(nodes)
            ]));

    const _getNodes = (nodes: RouteNodeDocument[]): Promise<SocketTypes.RouteNode[]> =>
        Promise.resolve(
            nodes.map(node => {
                return <SocketTypes.RouteNode>{
                    _id: node._id,
                    color: node.color || '#000'
                };
            }));

    const _getBoundingBox = (nodes: RouteNodeDocument[]): Promise<SocketTypes.BoundingBox> =>
        Promise.all([
            Routes.getMinMaxLatLon(nodes, 'lat', 1), // Minimum latitude
            Routes.getMinMaxLatLon(nodes, 'lat', -1), // Maximum latitude
            Routes.getMinMaxLatLon(nodes, 'lon', 1), // Minimum longitude
            Routes.getMinMaxLatLon(nodes, 'lon', -1) // Maximum longitude
        ])
            .then(([minLat, maxLat, minLon, maxLon]) => {
                return <SocketTypes.BoundingBox>{ minLat, maxLat, minLon, maxLon };
            });

    const _getLocations = (nodes: RouteNodeDocument[], skip: number, limit: number): Promise<SocketTypes.Location[]> =>
        LocationModel.find({ node: { $in: Util.getObjectIDs(nodes) } }).select({ node: 1, timestamp: 1, lat: 1, lon: 1 })
            .sort({ visualArea: 'desc' }).skip(skip).limit(limit).exec()
            .then(locations => locations.map(location => {
                return <SocketTypes.Location>{
                    _id: location._id,
                    node: location.node,
                    timestamp: location.timestamp,
                    lat: location.lat,
                    lon: location.lon
                };
            }));

    const _sendLocations = (socket: socketio.Socket) => {
        const _sendBatchAndRecurse = (nodes: RouteNodeDocument[], batchN = 0): Promise<any> => {
            if (!socket.connected) return Promise.resolve();

            let skip = 100 * (2 ** batchN - 1);
            let count = 100 * 2 ** batchN;

            return _getLocations(nodes, skip, count)
                .then(batch => {
                    socket.emit(SocketIds.LOCATIONS, ++batchN, batch);
                    if (batch.length == count)
                        return _sendBatchAndRecurse(nodes, batchN);
                    return [];
                })
                .catch(() => []);
        };
        return _sendBatchAndRecurse;
    };
}
