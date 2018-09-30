import * as socketio from 'socket.io';

import { Sockets } from './sockets';
import { SocketIds } from './ids';

export namespace SocketHandler {
    export const bindHandlers = (io: socketio.Server) =>
        io.on('connection', socket =>
            socket.on(SocketIds.REQUEST, Sockets.getExpeditie(socket)));
}
