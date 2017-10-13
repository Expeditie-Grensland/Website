import * as express from "express"

export namespace SocketIDs {

}

export namespace SocketHandler {
    type Handler = (socket: SocketIO.Socket) => void

    export function bindHandlers(app: express.Express, io: SocketIO.Server) {
        io.on("connection", connection(app))
    }

    export function connection(app: express.Express): Handler {
        return socket => {
            
        }
    }
}