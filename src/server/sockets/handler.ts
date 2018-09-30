import * as socketio from 'socket.io';

import { Sockets } from './sockets';
import { SocketIds } from './ids';

export namespace SocketHandler {
    type Handler = (socket: socketio.Socket) => void;

    export function bindHandlers(io: socketio.Server) {
        io.on('connection', connection());
    }

    function connection(): Handler {
        return socket =>
            socket
                .on(SocketIds.GET_NODES, Sockets.getNodes(socket))
                .on(SocketIds.GET_BOUNDINGBOX, Sockets.getBoundingBox(socket))
                .on(SocketIds.GET_LOCATIONS, Sockets.getLocations(socket));
    }
}
