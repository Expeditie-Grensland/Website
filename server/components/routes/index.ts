import { ColorHelper } from '../../helpers/colorHelper';
import { Expedities } from '../expedities';
import { People } from '../people';
import { Util } from '../documents/util';
import { RouteEdge, RouteNode, RouteNodeDocument, RouteNodeModel, RouteNodeOrID } from '../routenodes/model';
import { BoundingBox, Route, RouteDocument, RouteModel, RouteOrID } from './model';
import { Locations } from '../locations';
import { ExpeditieDocument, ExpeditieOrID } from '../expedities/model';
import { PersonOrID } from '../people/model';

export namespace Routes {
    export function create(route: Route): Promise<RouteDocument> {
        return RouteModel.create(route);
    }

    export function getById(_id: string): Promise<RouteDocument> {
        return RouteModel.findById(_id).exec();
    }

    export const getDocument: ((route: RouteOrID) => Promise<RouteDocument>) =
        Util.getDocument(getById);

    export function getAll(): Promise<RouteDocument[]> {
        return RouteModel.find({}).exec();
    }

    export function getNodes(route: RouteOrID): Promise<RouteNodeDocument[]> {
        return RouteNodeModel.find({ route: Util.getObjectID(route) }).exec();
    }

    function createRouteNode(node: RouteNode): Promise<RouteNodeDocument> {
        if (node.color === undefined) {
            node.color = ColorHelper.generateColorForRouteNode(node);
        }

        return RouteNodeModel.create(node);
    }

    export function setExpeditie(expeditie: ExpeditieOrID): (route: RouteOrID) => Promise<RouteDocument> {
        return route => RouteModel.findByIdAndUpdate(Util.getObjectID(route), { expeditie: Util.getObjectID(expeditie) }).exec();
    }

    export function populateNodePersons(node: RouteNodeOrID): Promise<RouteNodeDocument> {
        return Util.getDocument(getRouteNodeById)(node).then(node => node.populate('persons').execPopulate());
    }

    export const getRouteNode: ((routenode: RouteNodeOrID) => Promise<RouteNodeDocument>) =
        Util.getDocument(getRouteNodeById);

    export function getCurrentNodes(route: RouteOrID): Promise<RouteNodeDocument[]> {
        return getDocument(route).then(route => getRouteNodes(route.currentNodes));
    }

    export function getStartingNodes(route: RouteOrID): Promise<RouteNodeDocument[]> {
        return getDocument(route).then(route => getRouteNodes(route.startingNodes));
    }

    export function getCurrentNodeWithPerson(person: PersonOrID): (route: RouteOrID) => Promise<RouteNodeDocument> {
        return route =>
            getDocument(route).then(route =>
                RouteNodeModel.findOne({
                    _id: { $in: Util.getObjectIDs(route.currentNodes) },
                    route: Util.getObjectID(route),
                    persons: Util.getObjectID(person)
                }).exec()
            );
    }

    function getRouteNodes(nodes: RouteNodeOrID[]): Promise<RouteNodeDocument[]> {
        return Util.getDocuments(getRouteNodesById)(nodes);
    }

    function getRouteNodeById(_id: string): Promise<RouteNodeDocument> {
        return RouteNodeModel.findById(_id).exec();
    }

    function getRouteNodesById(ids: string[]): Promise<RouteNodeDocument[]> {
        return RouteNodeModel.find({ _id: { $in: ids } }).exec();
    }

    function setNodeEdges(edges: RouteEdge[]): (node: RouteNodeOrID) => Promise<RouteNodeDocument> {
        return node => RouteNodeModel.findByIdAndUpdate(Util.getObjectID(node), { edges: edges }, { new: true }).exec();
    }

    function getEdgeTo(edge: RouteEdge): Promise<RouteNodeDocument> {
        return getRouteNode(edge.to);
    }

    function getNodeEdges(node: RouteNodeOrID): Promise<RouteEdge[]> {
        return getRouteNode(node).then(node => node.edges);
    }

    export function setGroups(expeditie: ExpeditieOrID, groups: PersonOrID[][]): Promise<RouteDocument> {
        const groupsIds: string[][] = groups.map(group => Util.getObjectIDs(group));

        const pExpeditie = Util.getDocument(Expedities.getById)(expeditie);
        const pRoute = pExpeditie.then(Expedities.getRoute);
        const pCurrentNodes = pRoute.then(Routes.getCurrentNodes);
        const pStartingNodes = pRoute.then(Routes.getStartingNodes);
        const pCheckGroups = pCurrentNodes.then(currentNodes => checkGroups(groupsIds, currentNodes));
        const pNewCurrentNodes = Promise.all([pExpeditie, pRoute, pCurrentNodes, pCheckGroups]).then(
            ([expeditie, route, currentNodes, checkedGroups]) => createGroups(expeditie, route, currentNodes, checkedGroups)
        );

        return Promise.all([pExpeditie, pRoute, pCurrentNodes, pStartingNodes, pNewCurrentNodes]).then(
            ([expeditie, route, oldCurrentNodes, startingNodes, newCurrentNodes]) => {
                route.currentNodes = Util.getObjectIDs(newCurrentNodes);

                if (oldCurrentNodes.length == 0 && startingNodes.length == 0) {
                    route.startingNodes = Util.getObjectIDs(newCurrentNodes);
                } else {
                    let setEdgePromises: Promise<RouteNodeDocument>[] = [];
                    let newNodesWithToEdge: string[] = [];

                    for (let oldCurrentNode of oldCurrentNodes) {
                        const edges: RouteEdge[] = [];

                        for (let newCurrentNode of newCurrentNodes) {
                            if (Util.getObjectID(oldCurrentNode) === Util.getObjectID(newCurrentNode)) {
                                break;
                            }

                            for (let oldPersonId of Util.getObjectIDs(oldCurrentNode.persons)) {
                                for (let newPersonId of Util.getObjectIDs(newCurrentNode.persons)) {
                                    if (oldPersonId === newPersonId) {
                                        let existingEdge: RouteEdge = null;

                                        for (let edge of edges) {
                                            if (Util.getObjectID(edge.to) === Util.getObjectID(newCurrentNode)) {
                                                existingEdge = edge;
                                                break;
                                            }
                                        }

                                        if (existingEdge != null) {
                                            existingEdge.people.push(Util.getObjectID(oldPersonId));
                                        } else {
                                            edges.push({
                                                to: Util.getObjectID(newCurrentNode),
                                                people: [oldPersonId]
                                            });

                                            newNodesWithToEdge.push(Util.getObjectID(newCurrentNode));
                                        }
                                    }
                                }
                            }
                        }

                        if (edges.length > 0) setEdgePromises.push(setNodeEdges(edges)(oldCurrentNode));
                    }

                    const newNodesWithoutToEdge = newCurrentNodes.filter(node => !newNodesWithToEdge.includes(Util.getObjectID(node)));

                    if (newNodesWithoutToEdge.length > 0) {
                        route.startingNodes.push(...newNodesWithoutToEdge.map(node => Util.getObjectID(node)));
                    }

                    return Promise.all(<any[]>[route.save(), ...setEdgePromises]).then(res => res[0]);
                }

                return route.save();
            }
        );
    }

    export async function getBoundingBox(route: RouteOrID): Promise<BoundingBox> {
        const nodes = await getNodes(route);

        console.log(route);
        console.log(nodes);

        const minLat = Locations.getMinMaxLatLonLocation(nodes, 'min', 'lat');
        const maxLat = Locations.getMinMaxLatLonLocation(nodes, 'max', 'lat');
        const minLon = Locations.getMinMaxLatLonLocation(nodes, 'min', 'lon');
        const maxLon = Locations.getMinMaxLatLonLocation(nodes, 'max', 'lon');

        return Promise.all([minLat, maxLat, minLon, maxLon]).then(([minLat, maxLat, minLon, maxLon]) => {
            return {
                minLat: minLat[0].lat,
                maxLat: maxLat[0].lat,
                minLon: minLon[0].lon,
                maxLon: maxLon[0].lon
            };
        });
    }

    export const personArraysEqual = (arrayA: PersonOrID[], arrayB: PersonOrID[]): boolean => {
        if (arrayA.length !== arrayB.length)
            return false;

        const aIds = Util.getObjectIDs(arrayA).sort();
        const bIds = Util.getObjectIDs(arrayB).sort();

        for (let i = 0; i < aIds.length; i++) {
            // TODO: Fix when changing from strings to Objectids
            if (aIds[i] !== bIds[i])
                return false;
        }

        return true;
    };

    function checkGroups(groups: string[][], currentNodes: RouteNodeDocument[]): Promise<string[][]> {
        const oldGroups: string[][] = currentNodes.map(node => Util.getObjectIDs(node.persons));

        const newGroupsPersonIds: string[] = [].concat(...groups);

        for (let group of oldGroups) {
            for (let personId of group) {
                if (newGroupsPersonIds.indexOf(personId) < 0) {
                    return People.getById(personId).then(person =>
                        Promise.reject(
                            'The new groups should at least contain all people from the old groups! Person \'' +
                            person.name +
                            '\' is not specified in the new groups!'
                        )
                    );
                }
            }
        }

        if (new Set(newGroupsPersonIds).size !== newGroupsPersonIds.length) {
            let ids: string[] = [];
            const duplicatePeople: string[] = newGroupsPersonIds.filter(id => {
                const value = ids.includes(id);

                ids.push(id);

                return value;
            });

            return People.getByIds(duplicatePeople).then(persons => {
                const str = persons.map(person => person.name + ' ');

                return Promise.reject('People can\'t exist in multiple groups at the same time! Duplicates: [' + str + ']');
            });
        }

        return Promise.resolve(groups);
    }

    function createGroups(
        expeditie: ExpeditieDocument,
        route: RouteDocument,
        currentNodes: RouteNodeDocument[],
        groups: string[][]
    ): Promise<RouteNodeDocument[]> {
        return Promise.resolve()
            .then(() => {
                const personIds: string[] = [].concat(...groups.map(group => Util.getObjectIDs(group)));

                const peopleNotInExpeditie = personIds.filter(p => !Util.getObjectIDs(expeditie.participants).includes(p));

                if (peopleNotInExpeditie.length > 0) {
                    console.info('Adding as participants: ' + peopleNotInExpeditie);
                    return Expedities.addParticipants(peopleNotInExpeditie)(expeditie);
                } else {
                    return expeditie;
                }
            })
            .then(expeditie => {
                const newRouteNodes: string[][] = [];
                const pRouteNodes: Promise<RouteNodeDocument>[] = [];

                for (let group of groups) {
                    let groupNeedsNewNode = true;
                    let nonNewNode = null;

                    for (let node of currentNodes) {
                        if (personArraysEqual(node.persons, group)) {
                            groupNeedsNewNode = false;
                            nonNewNode = node;
                            break;
                        }
                    }

                    if (groupNeedsNewNode) {
                        newRouteNodes.push(Util.getObjectIDs(group));
                    } else {
                        pRouteNodes.push(getRouteNode(nonNewNode));
                    }
                }

                pRouteNodes.push(
                    ...newRouteNodes.map(groupIds => {
                        return createRouteNode({
                            route: Util.getObjectID(route),
                            persons: groupIds,
                            edges: []
                        });
                    })
                );

                return Promise.all(pRouteNodes);
            });
    }
}
