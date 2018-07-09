declare const io

namespace SocketIDs {
    export const GET_ROUTE = "GetRoute"
    export const GET_NODES = "GetNodes"
    export const GET_LOCATIONS = "GetLocations"
    export const LOCATIONS_DONE = "LocationsDone"
    export const GET_PLACES = "GetPlaces"
}

namespace SocketHandler {
    export let socket

    export function init() {
        socket = io()

        socket.on(SocketIDs.GET_ROUTE, Sockets.getRoute)
        socket.on(SocketIDs.GET_NODES, Sockets.getNodes)
        socket.on(SocketIDs.GET_LOCATIONS, Sockets.getLocations)
        socket.on(SocketIDs.LOCATIONS_DONE, Sockets.locationsDone)
        socket.on(SocketIDs.GET_PLACES, Sockets.getPlaces)
    }

    export function requestRoute(expeditieNameShort: string) {
        LoadingBar.setLoadingText("Loading route...")
        socket.emit(SocketIDs.GET_ROUTE, expeditieNameShort)
    }

    export function requestNodes(expeditieNameShort: string) {
        LoadingBar.setLoadingText("Loading route nodes...")
        socket.emit(SocketIDs.GET_NODES, expeditieNameShort)
    }

    export function requestLocations(expeditieNameShort: string) {
        LoadingBar.setLoadingText("Loading locations...")
        socket.emit(SocketIDs.GET_LOCATIONS, expeditieNameShort)
    }

    export function requestPlaces(expeditieNameShort: string) {
        LoadingBar.setLoadingText("Loading places...")
        socket.emit(SocketIDs.GET_PLACES, expeditieNameShort)
    }
}
