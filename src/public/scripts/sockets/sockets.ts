import { SocketHandler } from './handler';
import { MapHandler } from '../map/mapHandler';
import { LoadingBar } from '../map/loadingBar';
import { SocketTypes } from './types';

export namespace Sockets {
    export function getNodes(nodes: SocketTypes.RouteNode[]) {
        LoadingBar.setLoadingText('Received nodes.');

        MapHandler.addNodes(nodes);

        SocketHandler.requestBoundingBox();
    }

    export function getBoundingBox(boundingBox: SocketTypes.BoundingBox) {
        LoadingBar.setLoadingText('Received bounding box.');

        MapHandler.setBoundingBox(boundingBox);

        SocketHandler.requestLocations();
    }

    export function getLocations(batchNumber: number, locations: SocketTypes.Location[]) {
        LoadingBar.setLoadingText(
            `Received location batch ${batchNumber} with ${locations.length} locations.`
        );

        MapHandler.addLocations(locations);
    }

    export function locationsDone() {
        LoadingBar.setLoadingDone();
    }
}
