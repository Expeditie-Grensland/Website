namespace Sockets {
    export function getRoute(expeditieNameShort: string, route: Tables.Route) {
        LoadingBar.setLoadingText("Received route.")

        MapHandler.setRoute(route)

        SocketHandler.requestNodes(expeditieNameShort)
    }

    export function getNodes(expeditieNameShort: string, nodes: Tables.RouteNode[]) {
        LoadingBar.setLoadingText("Received nodes.")

        MapHandler.addNodes(nodes)
        SocketHandler.requestLocations(expeditieNameShort)
    }

    export function getLocations(expeditieNameShort: string, batchNumber: number, locations: Tables.Location[]) {
        LoadingBar.setLoadingText("Received location batch " + batchNumber + " with " + locations.length + " locations")

        MapHandler.addLocations(locations)
    }

    export function locationsDone(expeditieNameShort: string) {
        SocketHandler.requestPlaces(expeditieNameShort)
    }

    export function getPlaces(expeditieNameShort: string, places: Tables.Place[]) {
        LoadingBar.setLoadingText("Received " + places.length + " places")

        MapHandler.addPlaces(places)

        LoadingBar.setLoadingDone(true)
    }
}