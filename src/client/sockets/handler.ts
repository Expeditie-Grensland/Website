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
            .on(SocketIds.STORY, Sockets.parseStoryElements)
            .on(SocketIds.DONE, Sockets.done);
    }

    export function request(lastUpdateTime?: number) {
        socket.emit(SocketIds.REQUEST, expeditieNameShort, lastUpdateTime);
    }
}
