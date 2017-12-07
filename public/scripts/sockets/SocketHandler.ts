declare const io

namespace SocketIDs {
    export const GET_ROUTE = "GetRoute"
    export const GET_NODES = "GetNodes"
    export const GET_LOCATIONS = "GetLocations"
}

namespace SocketHandler {
    export let socket

    export function init() {
        socket = io()

        socket.on(SocketIDs.GET_ROUTE, Sockets.getRoute)
        socket.on(SocketIDs.GET_NODES, Sockets.getNodes)
        socket.on(SocketIDs.GET_LOCATIONS, Sockets.getLocations)
    }

    export function requestRoute(expeditieNameShort: string) {
        socket.emit(SocketIDs.GET_ROUTE, expeditieNameShort)
    }

    export function requestNodes(expeditieNameShort: string) {
        socket.emit(SocketIDs.GET_NODES, expeditieNameShort)
    }

    export function requestLocations(expeditieNameShort: string) {
        socket.emit(SocketIDs.GET_LOCATIONS, expeditieNameShort)
    }
}