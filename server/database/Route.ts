import {TableData, Tables} from "./Tables"
import {Util} from "./Util"
import {Expeditie} from "./Expeditie"
import {Person} from "./Person"
import {ColorHelper} from "../helper/ColorHelper"
import {Location} from "./Location"
import RouteDocument = TableData.Route.RouteDocument
import RouteNode = TableData.RouteNode.RouteNode
import RouteEdge = TableData.RouteEdge.RouteEdge
import RouteNodeDocument = TableData.RouteNode.RouteNodeDocument


export namespace Route {
    import ExpeditieOrID = TableData.ExpeditieOrID
    import RouteOrID = TableData.RouteOrID
    import RouteNodeOrID = TableData.RouteNodeOrID
    import PersonOrID = TableData.PersonOrID
    import ExpeditieDocument = TableData.Expeditie.ExpeditieDocument
    import LocationOrID = TableData.LocationOrID
    import RouteBoundingBox = TableData.RouteBoundingBox.RouteBoundingBox

    export function createRoute(route: TableData.Route.Route): Promise<RouteDocument> {
        if(route.boundingBox === undefined) {
            route.boundingBox = {
                minLat: Number.POSITIVE_INFINITY,
                minLon: Number.POSITIVE_INFINITY,
                maxLat: Number.NEGATIVE_INFINITY,
                maxLon: Number.NEGATIVE_INFINITY
            }
        }

        return Tables.Route.create(route)
    }

    export function getRouteById(_id: string): Promise<RouteDocument> {
        return Tables.Route.findById(_id).exec()
    }

    export function getRoute(route: RouteOrID): Promise<RouteDocument> {
        return Util.getDocument(route, getRouteById)
    }

    export function getRoutes(): Promise<RouteDocument[]> {
        return Tables.Route.find({}).exec()
    }

    export function getNodes(route: RouteOrID): Promise<RouteNodeDocument[]> {
        return Tables.RouteNode.find({route: Util.getObjectID(route)}).exec()
    }

    function createRouteNode(node: RouteNode): Promise<RouteNodeDocument> {
        if(node.color === undefined) {
            node.color = ColorHelper.generateColorForRouteNode(node)
        }

        return Tables.RouteNode.create(node)
    }

    export function setExpeditie(expeditie: ExpeditieOrID): (route: RouteOrID) => Promise<RouteDocument> {
        return route => Tables.Route.findByIdAndUpdate(Util.getObjectID(route), {expeditie: Util.getObjectID(expeditie)}).exec()
    }

    export function populateNodePersons(node: RouteNodeOrID): Promise<RouteNodeDocument> {
        return Util.getDocument(node, getRouteNodeById).then(node => node.populate('persons').execPopulate())
    }

    export function getRouteNode(node: RouteNodeOrID): Promise<RouteNodeDocument> {
        return Util.getDocument(node, getRouteNodeById)
    }

    export function getCurrentNodes(route: RouteOrID): Promise<RouteNodeDocument[]> {
        return getRoute(route).then(route => getRouteNodes(route.currentNodes))
    }

    export function getStartingNodes(route: RouteOrID): Promise<RouteNodeDocument[]> {
        return getRoute(route).then(route => getRouteNodes(route.startingNodes))
    }

    export function getCurrentNodeWithPerson(person: PersonOrID): (route: RouteOrID) => Promise<RouteNodeDocument> {
        return route => getRoute(route).then(route => Tables.RouteNode.findOne(
            {
                _id: { $in: Util.getObjectIDs(route.currentNodes) },
                route: Util.getObjectID(route),
                persons: Util.getObjectID(person)
            }).exec())
    }

    function getRouteNodes(nodes: RouteNodeOrID[]): Promise<RouteNodeDocument[]> {
        return Util.getDocuments(nodes, getRouteNodesById)
    }

    function getRouteNodeById(_id: string): Promise<RouteNodeDocument> {
        return Tables.RouteNode.findById(_id).exec()
    }

    function getRouteNodesById(ids: string[]): Promise<RouteNodeDocument[]> {
        return Tables.RouteNode.find({_id: {$in: ids}}).exec()
    }

    function setNodeEdges(edges: RouteEdge[]): (node: RouteNodeOrID) => Promise<RouteNodeDocument> {
        return node => Tables.RouteNode.findByIdAndUpdate(Util.getObjectID(node), {edges: edges}, {new: true}).exec()
    }

    function getEdgeTo(edge: RouteEdge): Promise<RouteNodeDocument> {
        return getRouteNode(edge.to)
    }

    function getNodeEdges(node: RouteNodeOrID): Promise<RouteEdge[]> {
        return getRouteNode(node).then((node) => node.edges)
    }

    export function setGroups(expeditie: ExpeditieOrID, groups: PersonOrID[][]): Promise<RouteDocument> {
        const groupsIds: string[][] = groups.map(group => Util.getObjectIDs(group))

        const pExpeditie = Util.getDocument(expeditie, Expeditie.getExpeditieById)
        const pRoute = pExpeditie.then(Expeditie.getRoute)
        const pCurrentNodes = pRoute.then(Route.getCurrentNodes)
        const pStartingNodes = pRoute.then(Route.getStartingNodes)
        const pCheckGroups = pCurrentNodes.then(currentNodes => checkGroups(groupsIds, currentNodes))
        const pNewCurrentNodes = Promise.all([pExpeditie, pRoute, pCurrentNodes, pCheckGroups])
            .then(([expeditie, route, currentNodes, checkedGroups]) => createGroups(expeditie, route, currentNodes, checkedGroups))


        return Promise.all([pExpeditie, pRoute, pCurrentNodes, pStartingNodes, pNewCurrentNodes])
            .then(([expeditie, route, oldCurrentNodes, startingNodes, newCurrentNodes]) => {
                route.currentNodes = Util.getObjectIDs(newCurrentNodes)

                if(oldCurrentNodes.length == 0 && startingNodes.length == 0) {
                    route.startingNodes = Util.getObjectIDs(newCurrentNodes)
                } else {
                    let setEdgePromises: Promise<RouteNodeDocument>[] = []
                    let newNodesWithToEdge: string[] = []

                    for(let oldCurrentNode of oldCurrentNodes) {
                        const edges: RouteEdge[] = []

                        for(let newCurrentNode of newCurrentNodes) {
                            if(Util.getObjectID(oldCurrentNode) === Util.getObjectID(newCurrentNode)) {
                                break
                            }

                            for(let oldPersonId of Util.getObjectIDs(oldCurrentNode.persons)) {
                                for(let newPersonId of Util.getObjectIDs(newCurrentNode.persons)) {
                                    if(oldPersonId === newPersonId) {

                                        let existingEdge: RouteEdge = null

                                        for(let edge of edges) {
                                            if(Util.getObjectID(edge.to) === Util.getObjectID(newCurrentNode)) {
                                                existingEdge = edge
                                                break
                                            }
                                        }

                                        if(existingEdge != null) {
                                            existingEdge.people.push(Util.getObjectID(oldPersonId))
                                        } else {
                                            edges.push({
                                                to: Util.getObjectID(newCurrentNode),
                                                people: [oldPersonId]
                                            })

                                            newNodesWithToEdge.push(Util.getObjectID(newCurrentNode))
                                        }
                                    }
                                }
                            }
                        }

                        if(edges.length > 0)
                            setEdgePromises.push(setNodeEdges(edges)(oldCurrentNode))
                    }

                    const newNodesWithoutToEdge = newCurrentNodes.filter(node => !newNodesWithToEdge.includes(Util.getObjectID(node)))

                    if(newNodesWithoutToEdge.length > 0) {
                        route.startingNodes.push(...newNodesWithoutToEdge.map(node => Util.getObjectID(node)))
                    }

                    return Promise.all([route.save(), ...setEdgePromises]).then((res) => res[0])
                }

                return route.save()
            })
    }

    export async function getBoundingBox(route: RouteOrID): Promise<RouteBoundingBox> {
        return (await getRoute(route)).boundingBox
    }

    export function setBoundingBox(boundingBox: RouteBoundingBox): (route: RouteOrID) => Promise<RouteDocument> {
        return route => Tables.Route.findByIdAndUpdate(Util.getObjectID(route), {boundingBox: boundingBox}, {new: true}).exec()
    }

    export function expandBoundingBox(locations: LocationOrID[]): (route: RouteOrID) => Promise<RouteDocument> {
        return async r => {
            const route = await getRoute(r)
            const bbox = await getBoundingBox(route)

            for(let location of await Location.getLocations(locations)) {
                if(location.lat < bbox.minLat) {
                    bbox.minLat = location.lat
                }
                if(location.lat > bbox.maxLat) {
                    bbox.maxLat = location.lat
                }
                if(location.lon < bbox.minLon) {
                    bbox.minLon = location.lon
                }
                if(location.lon > bbox.maxLon) {
                    bbox.maxLon = location.lon
                }
            }

            return setBoundingBox(bbox)(route)
        }
    }

    export function personArraysEqual(array1: PersonOrID[], array2: PersonOrID[]): boolean {
        const a1 = Util.getObjectIDs(array1).sort()
        const a2 = Util.getObjectIDs(array2).sort()

        for(let person1 of a1) {
            for(let person2 of a2) {
                if(person1 != person2)
                    return false
            }
        }
        return true
    }

    function checkGroups(groups: string[][], currentNodes: RouteNodeDocument[]): Promise<string[][]> {
        const oldGroups: string[][] = currentNodes.map((node) => Util.getObjectIDs(node.persons))

        const newGroupsPersonIds: string[] = [].concat(...groups)

        for(let group of oldGroups) {
            for(let personId of group) {
                if(newGroupsPersonIds.indexOf(personId) < 0) {
                    return Person.getPersonById(personId).then(person =>
                        Promise.reject("The new groups should at least contain all people from the old groups! Person '" + person.name + "' is not specified in the new groups!")
                    )
                }
            }
        }

        if((new Set(newGroupsPersonIds)).size !== newGroupsPersonIds.length) {
            let ids: string[] = []
            const duplicatePeople: string[] = newGroupsPersonIds.filter((id) => {
                const value = ids.includes(id)

                ids.push(id)

                return value
            })

            return Person.getPersonsByIds(duplicatePeople).then(persons => {
                const str = persons.map(person => person.name + " ")

                return Promise.reject("People can't exist in multiple groups at the same time! Duplicates: [" + str + "]")
            })
        }

        return Promise.resolve(groups)
    }

    function createGroups(expeditie: ExpeditieDocument, route: RouteDocument, currentNodes: RouteNodeDocument[], groups: string[][]): Promise<RouteNodeDocument[]> {
        return Promise.resolve().then(() => {
            const personIds: string[] = [].concat(...groups.map((group) => Util.getObjectIDs(group)))

            const peopleNotInExpeditie = personIds.filter((p) => !Util.getObjectIDs(expeditie.participants).includes(p))

            if (peopleNotInExpeditie.length > 0) {
                console.log("Adding as participants: " + peopleNotInExpeditie)
                return Expeditie.addParticipants(peopleNotInExpeditie)(expeditie)
            } else {
                return expeditie
            }
        }).then(expeditie => {
            const newRouteNodes: string[][] = []
            const pRouteNodes: Promise<RouteNodeDocument>[] = []

            for (let group of groups) {
                let groupNeedsNewNode = true
                let nonNewNode = null

                for (let node of currentNodes) {
                    if (personArraysEqual(node.persons, group)) {
                        groupNeedsNewNode = false
                        nonNewNode = node
                        break
                    }
                }

                if (groupNeedsNewNode) {
                    newRouteNodes.push(Util.getObjectIDs(group))
                } else {
                    pRouteNodes.push(getRouteNode(nonNewNode))
                }
            }

            pRouteNodes.push(...newRouteNodes.map((groupIds) => {
                return createRouteNode({
                    route:   Util.getObjectID(route),
                    persons: groupIds,
                    edges:   []
                })
            }))

            return Promise.all(pRouteNodes)
        })
    }

    export function populateRoute(route: RouteOrID): Promise<RouteDocument> {
        return Util.getDocument(route, getRouteById).then(route => {

            return getNodes(route).then(allNodes => {
                    const map: Map<string, RouteNodeDocument> = new Map()

                    for(let node of allNodes) {
                        map.set(Util.getObjectID(node), node)
                    }

                    const startingNodes = route.startingNodes
                    let currentNodes = route.startingNodes

                    function next(node: RouteNodeOrID, depthLeft: number): Promise<RouteNodeDocument> {
                        if(depthLeft <= 0) {
                            return Promise.reject("Route graph could not be resolved. Either the graph is extremely large or contains circular references.")
                        }
                        node = map.get(Util.getObjectID(node))

                        node.edges.map(edge =>
                            next(edge.to, depthLeft-1).then(to => {
                                edge.to = to
                                return edge
                            })
                        )

                        return Promise.resolve(node)
                    }

                    return Promise.all(route.startingNodes.map(node => next(node, 100))).then((startingNodes) => {
                        route.startingNodes = startingNodes
                        return route
                    })
                })
        })
    }
}