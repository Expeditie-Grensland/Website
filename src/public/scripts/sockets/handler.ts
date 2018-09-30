import socketio from 'socket.io-client';

import { Sockets } from './sockets';
import { LoadingBar } from '../map/loadingBar';
import { SocketIds } from './ids';

export namespace SocketHandler {
    export let socket: SocketIOClient.Socket;
    let _expeditieNameShort: string;

    export function init() {
        socket = socketio();

        socket
            .on(SocketIds.NODES, Sockets.getNodes)
            .on(SocketIds.BOUNDINGBOX, Sockets.getBoundingBox)
            .on(SocketIds.LOCATIONS, Sockets.getLocations)
            .on(SocketIds.LOCATIONS_DONE, Sockets.locationsDone);
    }

    export function request(expeditienameShort: string) {
        _expeditieNameShort = expeditienameShort;
        requestNodes();
    }

    export function requestNodes() {
        LoadingBar.setLoadingText('Loading route nodes...');
        socket.emit(SocketIds.GET_NODES, _expeditieNameShort);
    }

    export function requestBoundingBox() {
        LoadingBar.setLoadingText('Loading bounding box...');
        socket.emit(SocketIds.GET_BOUNDINGBOX, _expeditieNameShort);
    }

    export function requestLocations() {
        LoadingBar.setLoadingText('Loading locations...');
        socket.emit(SocketIds.GET_LOCATIONS, _expeditieNameShort);
    }
}
