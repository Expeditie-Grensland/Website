import {TableData, Tables} from "./Tables"
import randomColor = require("randomcolor")

export namespace Route {

    import Route = TableData.Route.Route
    import RouteDocument = TableData.Route.RouteDocument
    import RouteNode = TableData.RouteNode.RouteNode
    import RouteNodeDocument = TableData.RouteNode.RouteNodeDocument

    export function createRoute(route: Route): Promise<RouteDocument> {
        return Promise.resolve().then(() => {
            if(route.startingNodes == undefined && route.currentNodes == undefined) {
                return createRouteNode({
                    persons: [],
                    locations: [],
                    edges: []
                }).then((node) => {
                    route.startingNodes = [node]
                    route.currentNodes = [node]

                    return route
                })
            }

            return route
        }).then((route) => {
            return Tables.Route.create(route)
        })
    }

    export function createRouteNode(node: RouteNode): Promise<RouteNodeDocument> {
        if(node.color == undefined || node.color == "") {
            if(node.persons.length > 0) {
                const seed = (<string[]>node.persons).join()

                node.color = randomColor({
                    seed: seed
                })
            } else {
                node.color = randomColor()
            }
        }

        return Tables.RouteNode.create(node)
    }
}