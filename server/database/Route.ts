import {TableData, Tables} from "./Tables"
import {Util} from "./Util"
import {Person} from "./Person"
import {Expeditie} from "./Expeditie"
import randomColor = require("randomcolor")


export namespace Route {

    import Route = TableData.Route.Route
    import RouteDocument = TableData.Route.RouteDocument
    import RouteNode = TableData.RouteNode.RouteNode
    import RouteEdge = TableData.RouteEdge.RouteEdge
    import RouteEdgeDocument = TableData.RouteEdge.RouteEdgeDocument
    import PersonOrID = Person.PersonOrID
    import ExpeditieOrID = Expeditie.ExpeditieOrID
    import RouteNodeDocument = TableData.RouteNode.RouteNodeDocument
    import getPersonsByIds = Person.getPersonsByIds

    export type RouteOrID =  Util.DocumentOrID<RouteDocument>
    export type NodeOrID = Util.DocumentOrID<RouteNodeDocument>
    export type EdgeOrID = Util.DocumentOrID<RouteEdgeDocument>

    export function createRoute(route: Route): Promise<RouteDocument> {
        return Tables.Route.create(route)
    }

    export function getRouteById(_id: string): Promise<RouteDocument> {
        return Tables.Route.findById(_id).exec()
    }

    function createRouteNode(node: RouteNode): Promise<RouteNodeDocument> {
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

    function createRouteEdge(edge: RouteEdge): Promise<RouteEdgeDocument> {
        return Tables.RouteEdge.create(edge)
    }

    function getRouteNodeById(_id: string): Promise<RouteNodeDocument> {
        return Tables.RouteNode.findById(_id).exec()
    }

    function getRouteNodesById(ids: string[]): Promise<RouteNodeDocument[]> {
        return Tables.RouteNode.find({_id: {$in: ids}}).exec()
    }

    function getRouteEdgeById(_id: string): Promise<RouteEdgeDocument> {
        return Tables.RouteEdge.findById(_id).exec()
    }

    function getRouteEdgesById(ids: string[]): Promise<RouteEdgeDocument[]> {
        return Tables.RouteEdge.find({_id: {$in: ids}}).exec()
    }

    function setNodeEdges(edges: EdgeOrID[]): (node: NodeOrID) => Promise<RouteNodeDocument> {
        return node => Tables.RouteNode.findByIdAndUpdate(Util.getDocumentId(node), {$pushAll: {edges: Util.getObjectIDs(edges)}}, {new: true}).exec()
    }

    function getEdgeTo(edge: EdgeOrID): Promise<RouteNodeDocument> {
        return Util.getDocument(edge, getRouteEdgeById).then((edge) => Util.getDocument(edge.to, getRouteNodeById))
    }

    function getNodeEdges(node: NodeOrID): Promise<RouteEdgeDocument[]> {
        return Util.getDocument(node, getRouteNodeById).then((node) => Util.getDocuments(node.edges, getRouteEdgesById))
    }

    export function setGroups(expeditie: ExpeditieOrID, groups: PersonOrID[][]): (route: RouteOrID) => Promise<RouteDocument> {
        return (route: RouteOrID) => {
            return Util.getDocument(route, Route.getRouteById).then(resolveGroups(groups)).then((groups) => {
                console.log(groups)

                return new Promise<RouteDocument>((resolve, reject) => {
                    const personIds: string[] = [].concat(...groups.map((group) => Util.getDocumentIds(group)))

                    if((new Set(personIds)).size !== personIds.length) {
                        reject("People can't exist in multiple groups at the same time!")
                    }

                    const pExpeditie = Util.getDocument(expeditie, Expeditie.getExpeditieById).then((expeditie) => {
                        const peopleNotInExpeditie = personIds.filter((p) => Util.getDocumentIds(expeditie.participants).indexOf(p) < 0)

                        if(peopleNotInExpeditie.length > 0) {
                            console.log("adding as participants: " + peopleNotInExpeditie)
                            return Expeditie.addParticipants(peopleNotInExpeditie)(expeditie)
                        } else {
                            return expeditie
                        }
                    })

                    const pRouteNodes: Promise<RouteNodeDocument[]> = Promise.all(groups.map((group: PersonOrID[]) => Util.getDocumentIds(group)).map((groupIds) => {
                        return createRouteNode({
                            persons: groupIds,
                            locations: [],
                            edges: []
                        })
                    }))

                    const pRoute = Util.getDocument(route, Route.getRouteById)

                    const pCurrentNodes = pRoute.then((route) => Util.getDocuments(route.currentNodes, getRouteNodesById))
                    const pStartingNodes = pRoute.then((route) => Util.getDocuments(route.startingNodes, getRouteNodesById))

                    const result: Promise<RouteDocument> = Promise.all([pExpeditie, pRouteNodes, pRoute, pCurrentNodes, pStartingNodes]).then(([expeditie, routeNodes, route, currentNodes, startingNodes]) => {
                        if(startingNodes.length == 0 && currentNodes.length == 0) {
                            route.startingNodes = Util.getDocumentIds(routeNodes)
                            route.currentNodes = Util.getDocumentIds(routeNodes)
                        } else {
                            let oldCurrentNodes: Promise<RouteNodeDocument>[] = []
                            let newCurrentNodes: RouteNodeDocument[] = routeNodes

                            for(let currentNode of <RouteNodeDocument[]>currentNodes) {
                                let newEdges: RouteEdge[] = []

                                for(let currentNodePersonId of Util.getDocumentIds(currentNode.persons)) {
                                    for(let newNode of routeNodes) {
                                        if (Util.getDocumentIds(newNode.persons).indexOf(currentNodePersonId) > -1) {
                                            let edgeExists = false
                                            let existingEdge: RouteEdge
                                            for(let edge of newEdges) {
                                                if(Util.getDocumentId(edge.to) == newNode._id) {
                                                    edgeExists = true
                                                    existingEdge = edge
                                                }
                                            }

                                            if(edgeExists) {
                                                existingEdge.people.push(currentNodePersonId)
                                            } else {
                                                newEdges.push({
                                                    people: [currentNodePersonId],
                                                    to: newNode._id
                                                })
                                            }
                                        }
                                    }
                                }

                                if(newEdges.length > 0) {
                                    oldCurrentNodes.push(
                                        Promise.resolve(currentNode).then((node) => {
                                            return Promise.all(newEdges.map(edge => createRouteEdge(edge))).then((edges) => {
                                                return setNodeEdges(edges)(node)
                                            })
                                        })
                                    )
                                } else {
                                    newCurrentNodes.push(currentNode)
                                }
                            }

                            return Promise.all(oldCurrentNodes).then(() => {
                                route.currentNodes = Util.getObjectIDs(newCurrentNodes)
                                return route.save()
                            })
                        }

                        return route.save()
                    })

                    resolve(result)
                })
            })
        }
    }

    function resolveGroups(groups: PersonOrID[][]): (route: RouteOrID) => Promise<PersonOrID[][]> {
        return (route: RouteOrID) => Util.getDocument(route, Route.getRouteById).then((route) => {
            const pOldGroups = Util.getDocumentIds(route.currentNodes).map((node) => Util.getDocument(node, getRouteNodeById).then((node) => Util.getDocumentIds(node.persons)))
            const newGroups = groups.map((group) => Util.getDocumentIds(group))

            const allModifiedIds: string[] = [].concat(...newGroups)

            return Promise.all(pOldGroups).then(oldGroups => {
                let result: string[][] = newGroups;

                for(let oldGroup of oldGroups) {
                    let unmodified: string[] = []

                    for(let personId of oldGroup) {
                        if(!allModifiedIds.includes(personId.toString())) {
                            unmodified.push(personId)
                        }
                    }

                    if(unmodified.length > 0) {
                        result.push(unmodified)
                    }
                }

                return result
            })
        })
    }

    export function populateCompletely(route: RouteOrID): Promise<RouteDocument> {
        return Util.getDocument(route, getRouteById).then((route) => {

            function populate(node: NodeOrID): Promise<RouteNodeDocument> {
                return Util.getDocument(node, getRouteNodeById).then((node) => {
                    return getNodeEdges(node).then((edges) => {
                        return Promise.all(edges.map(edge => {
                            return getEdgeTo(edge).then(populate).then((to) => {
                                edge.to = to
                                return edge
                            })
                        })).then(edges => {
                            node.edges = edges
                            return node
                        }).then(node => node.populate('persons').execPopulate())
                    })
                })
            }


            return Util.getDocument(route, getRouteById).then((route) => {
                return Util.getDocuments(route.startingNodes, getRouteNodesById).then((startingNodes) => {
                    return Promise.all(startingNodes.map((node) => populate(node)))
                }).then((startingNodes) => {
                    route.startingNodes = startingNodes
                    return route
                })
            })
        })
    }
}