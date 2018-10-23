import socketio from 'socket.io-client';

import { Sockets } from './sockets';
import { SocketIds } from './ids';

declare var expeditieNameShort: string;

export namespace SocketHandler {
    export let socket: SocketIOClient.Socket;

    export function init() {
        socket = socketio();

        socket
            .on(SocketIds.INFO, Sockets.parseInfo)
            .on(SocketIds.LOCATIONS, Sockets.parseLocations)
            .on(SocketIds.DONE, Sockets.done);
    }

    export function request(id?: string) {
        socket.emit(SocketIds.REQUEST, expeditieNameShort, id);
    }
}
