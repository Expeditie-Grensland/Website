import * as express from 'express'

import {Sockets} from './sockets'

export namespace SocketIDs {
    export const GET_ROUTE = "GetRoute"
    export const GET_NODES = "GetNodes"
    export const GET_LOCATIONS = "GetLocations"
    export const LOCATIONS_DONE = "LocationsDone"
}

export namespace SocketHandler {
    type Handler = (socket: SocketIO.Socket) => void

    export function bindHandlers(app: express.Express, io: SocketIO.Server) {
        io.on("connection", connection(app))
    }

    function connection(app: express.Express): Handler {
        return socket => {
            socket.on(SocketIDs.GET_ROUTE, Sockets.getRoute(app, socket))
            socket.on(SocketIDs.GET_NODES, Sockets.getNodes(app, socket))
            socket.on(SocketIDs.GET_LOCATIONS, Sockets.getLocations(app, socket))
        }
    }
}
