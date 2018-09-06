/// <reference path="../map/loadingBar.ts" />
/// <reference path="../map/mapHandler.ts" />
/// <reference path="socketHandler.ts" />

namespace Sockets {
    export function getRoute(expeditieNameShort: string, route: Tables.Route) {
        LoadingBar.setLoadingText('Received route.');

        MapHandler.setRoute(route);

        SocketHandler.requestBoundingBox(expeditieNameShort);
    }

    export function getBoundingBox(expeditieNameShort: string, boundingBox: Tables.RouteBoundingBox) {
        LoadingBar.setLoadingText('Received bounding box.');

        MapHandler.setBoundingBox(boundingBox);

        SocketHandler.requestNodes(expeditieNameShort);
    }

    export function getNodes(expeditieNameShort: string, nodes: Tables.RouteNode[]) {
        LoadingBar.setLoadingText('Received nodes.');

        MapHandler.addNodes(nodes);

        SocketHandler.requestLocations(expeditieNameShort);
    }

    export function getLocations(expeditieNameShort: string, batchNumber: number, locations: Tables.Location[]) {
        LoadingBar.setLoadingText(
            'Received location batch ' + batchNumber + ' with ' + locations.length + ' locations.'
        );

        MapHandler.addLocations(locations);
    }

    export function locationsDone(expeditieNameShort: string) {
        LoadingBar.setLoadingDone(true);
    }
}
