/// <reference path="sockets.ts" />

declare const io;

const enum SocketIDs {
    GET_NODES = 'GetNodes',
    GET_BOUNDINGBOX = 'GetBoundingBox',
    GET_LOCATIONS = 'GetLocations',
    LOCATIONS_DONE = 'LocationsDone'
}

namespace SocketHandler {
    export let socket;
    let _expeditieNameShort;

    export function init() {
        socket = io();

        socket
            .on(SocketIDs.GET_NODES, Sockets.getNodes)
            .on(SocketIDs.GET_BOUNDINGBOX, Sockets.getBoundingBox)
            .on(SocketIDs.GET_LOCATIONS, Sockets.getLocations)
            .on(SocketIDs.LOCATIONS_DONE, Sockets.locationsDone);
    }

    export function request(expeditienameShort: string) {
        _expeditieNameShort = expeditienameShort;
        requestNodes();
    }

    export function requestNodes() {
        LoadingBar.setLoadingText('Loading route nodes...');
        socket.emit(SocketIDs.GET_NODES, _expeditieNameShort);
    }

    export function requestBoundingBox() {
        LoadingBar.setLoadingText('Loading bounding box...');
        socket.emit(SocketIDs.GET_BOUNDINGBOX, _expeditieNameShort);
    }

    export function requestLocations() {
        LoadingBar.setLoadingText('Loading locations...');
        socket.emit(SocketIDs.GET_LOCATIONS, _expeditieNameShort);
    }
}
