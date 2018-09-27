import { SocketHandler } from './socketHandler';
import { Tables } from '../database/tables';
import { MapHandler } from '../map/mapHandler';
import { LoadingBar } from '../map/loadingBar';

export namespace Sockets {
    export function getNodes(nodes: Tables.RouteNode[]) {
        LoadingBar.setLoadingText('Received nodes.');

        MapHandler.addNodes(nodes);

        SocketHandler.requestBoundingBox();
    }

    export function getBoundingBox(boundingBox: Tables.RouteBoundingBox) {
        LoadingBar.setLoadingText('Received bounding box.');

        MapHandler.setBoundingBox(boundingBox);

        SocketHandler.requestLocations();
    }

    export function getLocations(batchNumber: number, locations: Tables.Location[]) {
        LoadingBar.setLoadingText(
            'Received location batch ' + batchNumber + ' with ' + locations.length + ' locations.'
        );

        MapHandler.addLocations(locations);
    }

    export function locationsDone() {
        LoadingBar.setLoadingDone(true);
    }
}
