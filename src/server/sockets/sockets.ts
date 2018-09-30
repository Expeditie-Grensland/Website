import * as socketio from 'socket.io';

import { Expedities } from '../components/expedities';
import { Routes } from '../components/routes';
import { SocketIds } from './ids';
import { Documents } from '../components/documents/new';
import { RouteNodeDocument, RouteNodeModel } from '../components/routeNodes/model';
import { Util } from '../components/documents/util';
import { RouteDocument } from '../components/routes/model';
import { SocketTypes } from './types';
import { LocationModel } from '../components/locations/model';

export namespace Sockets {
    const _emit = (socket: socketio.Socket, id: string): ((...args: any[]) => void) =>
        (...args) => socket.emit(id, ...args);

    const _getNodes = (route: RouteDocument): Promise<SocketTypes.RouteNode[]> =>
        RouteNodeModel.find({ route: Util.getObjectID(route) }).select({ color: 1 }).exec()
            .then(nodes => nodes.map(node => {
                return <SocketTypes.RouteNode>{
                    _id: node._id,
                    color: node.color || '#000'
                };
            }));


    export const getNodes = (socket: socketio.Socket) => (expeditieName: string): Promise<void> =>
        Expedities.getByNameShort(expeditieName)
            .then(Documents.ensureNotNull)
            .then(Expedities.getRoute)
            .then(_getNodes)
            .then(_emit(socket, SocketIds.NODES));

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

    export const getBoundingBox = (socket: socketio.Socket) => (expeditieName: string): Promise<void> =>
        Expedities.getByNameShort(expeditieName)
            .then(Documents.ensureNotNull)
            .then(Expedities.getRoute)
            .then(Routes.getNodes)
            .then(_getBoundingBox)
            .then(_emit(socket, SocketIds.BOUNDINGBOX));

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

    const _sendBatches = (socket: socketio.Socket) => {
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

    export const getLocations = (socket: socketio.Socket) => (expeditieName: string): Promise<void> =>
        Expedities.getByNameShort(expeditieName)
            .then(Documents.ensureNotNull)
            .then(Expedities.getRoute)
            .then(Routes.getNodes)
            .then(_sendBatches(socket))
            .then(_emit(socket, SocketIds.LOCATIONS_DONE));
}
