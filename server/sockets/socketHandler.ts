import * as socketio from 'socket.io';

import { Sockets } from './sockets';

export const enum SocketIDs {
    GET_NODES = 'GetNodes',
    GET_BOUNDINGBOX = 'GetBoundingBox',
    GET_LOCATIONS = 'GetLocations',
    LOCATIONS_DONE = 'LocationsDone'
}

export namespace SocketHandler {
    type Handler = (socket: socketio.Socket) => void;

    export function bindHandlers(io: socketio.Server) {
        io.on('connection', connection());
    }

    function connection(): Handler {
        return socket =>
            socket
                .on(SocketIDs.GET_NODES, Sockets.getNodes(socket))
                .on(SocketIDs.GET_BOUNDINGBOX, Sockets.getBoundingBox(socket))
                .on(SocketIDs.GET_LOCATIONS, Sockets.getLocations(socket));
    }
}
