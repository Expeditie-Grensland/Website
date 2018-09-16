import * as socketio from 'socket.io';

import { Expeditie } from '../components/expeditie';
import { Route } from '../components/route';
import { SocketIDs } from './socketHandler';
import { aPipe } from '../helpers/functionalHelper';
import { ExpeditieDocument } from '../components/expeditie/model';

export namespace Sockets {
    const _emit = (io: socketio.Socket, id: string): ((...args) => void) =>
        (...args) => io.emit(id, ...args);

    export const getNodes = (io: socketio.Socket): ((expeditieName: string) => Promise<void>) => aPipe(
        Expeditie.getByNameShort,
        Expeditie.getRoute,
        Route.getNodes,
        _emit(io, SocketIDs.GET_NODES)
    );

    export const getBoundingBox = (io: socketio.Socket): ((expeditieName: string) => Promise<void>) => aPipe(
        Expeditie.getByNameShort,
        Expeditie.getRoute,
        Route.getBoundingBox,
        _emit(io, SocketIDs.GET_BOUNDINGBOX)
    );

    const _sendBatches = (io: socketio.Socket) => {
        const _sendBatchAndRecurse = (expeditie: ExpeditieDocument, batchN = 0): Promise<any> => {
            if (!io.connected) return;

            let skip = 100 * (2 ** batchN - 1);
            let count = 100 * 2 ** batchN;

            return Expeditie.getLocationsSortedByVisualArea(expeditie, skip, count)
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

    export const getLocations = (io: socketio.Socket): ((expeditieName: string) => void) => aPipe(
        Expeditie.getByNameShort,
        _sendBatches(io),
        _emit(io, SocketIDs.LOCATIONS_DONE)
    );
}
