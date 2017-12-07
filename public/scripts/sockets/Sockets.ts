namespace Sockets {
    export function getRoute(expeditieNameShort: string, route: Tables.Route) {
        console.log("received route: ")
        console.log(route)

        MapHandler.setRoute(route)

        SocketHandler.requestNodes(expeditieNameShort)
    }

    export function getNodes(expeditieNameShort: string, nodes: Tables.RouteNode[]) {
        console.log("received nodes")
        console.log(nodes)

        MapHandler.addNodes(nodes)
        SocketHandler.requestLocations(expeditieNameShort)
    }

    export function getLocations(expeditieNameShort: string, locations: Tables.Location[]) {
        console.log("received locations: ")
        console.log(locations)

        MapHandler.addLocations(locations)
    }
}