import socketio from 'socket.io-client';

import { Sockets } from './sockets';
import { SocketIds } from './ids';

export namespace SocketHandler {
    export let socket: SocketIOClient.Socket;

    export function init() {
        socket = socketio();

        socket
            .on(SocketIds.NODES, Sockets.getNodes)
            .on(SocketIds.BOUNDINGBOX, Sockets.getBoundingBox)
            .on(SocketIds.LOCATIONS, Sockets.getLocations)
            .on(SocketIds.LOCATIONS_DONE, Sockets.locationsDone);
    }

    export function request(expeditieName: string) {
        socket.emit(SocketIds.GET_EXPEDITIE, expeditieName);
    }
}
