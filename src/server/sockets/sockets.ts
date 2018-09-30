import * as socketio from 'socket.io';

import { Expedities } from '../components/expedities';
import { Routes } from '../components/routes';
import { SocketIDs } from './socketHandler';
import { ExpeditieDocument } from '../components/expedities/model';
import { Locations } from '../components/locations';
import { Documents } from '../components/documents/new';

export namespace Sockets {
    const _emit = (io: socketio.Socket, id: string): ((...args: any[]) => void) =>
        (...args) => io.emit(id, ...args);

    export const getNodes = (io: socketio.Socket) => (expeditieName: string): Promise<void> =>
        Expedities.getByNameShort(expeditieName)
            .then(Documents.ensureNotNull)
            .then(Expedities.getRoute)
            .then(Routes.getNodes)
            .then(_emit(io, SocketIDs.GET_NODES));

    export const getBoundingBox = (io: socketio.Socket) => (expeditieName: string): Promise<void> =>
        Expedities.getByNameShort(expeditieName)
            .then(Documents.ensureNotNull)
            .then(Expedities.getRoute)
            .then(Routes.getBoundingBox)
            .then(_emit(io, SocketIDs.GET_BOUNDINGBOX));

    const _sendBatches = (io: socketio.Socket) => {
        const _sendBatchAndRecurse = (expeditie: ExpeditieDocument, batchN = 0): Promise<any> => {
            if (!io.connected) return Promise.resolve();

            let skip = 100 * (2 ** batchN - 1);
            let count = 100 * 2 ** batchN;

            return Expedities.getLocationsSortedByVisualArea(expeditie, skip, count)
                .then(batch => {
                    io.emit(SocketIDs.GET_LOCATIONS, ++batchN, batch);
                    if (batch.length == count)
                        return _sendBatchAndRecurse(expeditie, batchN);
                    return [];
                })
                .catch(() => []);
        };
        return _sendBatchAndRecurse;
    };

    export const getLocations = (io: socketio.Socket) => (expeditieName: string): Promise<void> =>
        Expedities.getByNameShort(expeditieName)
            .then(Documents.ensureNotNull)
            .then(_sendBatches(io))
            .then(_emit(io, SocketIDs.LOCATIONS_DONE));
}
