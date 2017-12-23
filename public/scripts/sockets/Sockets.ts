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

    export function getLocations(expeditieNameShort: string, zoomLevel: number, locations: Tables.Location[]) {
        LoadingBar.setLoadingText("Received locations for zoom level: " + zoomLevel)

        MapHandler.addLocations(locations)
    }

    export function loadingDone() {
        LoadingBar.setLoadingDone(true)
    }
}