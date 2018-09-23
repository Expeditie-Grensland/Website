import { Expedities } from '../expedities';
import { People } from '../people';
import { Util } from '../documents/util';
import { RouteEdge, RouteNodeDocument, RouteNodeModel, RouteNodeOrID } from '../routenodes/model';
import { BoundingBox, Route, RouteDocument, RouteModel, RouteOrID } from './model';
import { ExpeditieOrID } from '../expedities/model';
import { PersonOrID } from '../people/model';
import { LocationModel } from '../locations/model';
import { RouteNodes } from '../routenodes';

export namespace Routes {
    export const create = (route: Route): Promise<RouteDocument> =>
        RouteModel.create(route);

    export const getById = (_id: string): Promise<RouteDocument> =>
        RouteModel.findById(_id).exec();

    export const getDocument = (route: RouteOrID): Promise<RouteDocument> =>
        Util.getDocument(getById)(route);

    export const getAll = (): Promise<RouteDocument[]> =>
        RouteModel.find({}).exec();

    export const getNodes = (route: RouteOrID): Promise<RouteNodeDocument[]> =>
        RouteNodeModel.find({ route: Util.getObjectID(route) }).exec();

    export const getCurrentNodes = (route: RouteOrID): Promise<RouteNodeDocument[]> =>
        getDocument(route).then(route => RouteNodes.getDocuments(route.currentNodes));

    export const getStartingNodes = (route: RouteOrID): Promise<RouteNodeDocument[]> =>
        getDocument(route).then(route => RouteNodes.getDocuments(route.startingNodes));

    export const getCurrentNodeWithPerson = (person: PersonOrID) => (route: RouteOrID): Promise<RouteNodeDocument> =>
        getDocument(route).then(route =>
            RouteNodeModel.findOne({
                _id: { $in: Util.getObjectIDs(route.currentNodes) },
                route: Util.getObjectID(route),
                persons: Util.getObjectID(person)
            }).exec());

    // TOOD
    export const setGroups = (expeditie: ExpeditieOrID, groups: PersonOrID[][]): Promise<RouteDocument> => {
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

                        if (edges.length > 0) setEdgePromises.push(RouteNodes.setEdges(edges)(oldCurrentNode));
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
    };

    const _getMinMaxLatLon = (nodes: RouteNodeOrID[], latLon: 'lat' | 'lon', minMax: 1 | -1): Promise<number> => {
        const nodeIDs = Util.getObjectIDs(nodes);

        return LocationModel.find({ node: { $in: nodeIDs } })
            .sort({ [latLon]: minMax })
            .limit(1)
            .exec()
            .then(locations => locations[0][latLon]);
    };

    export const getBoundingBox = (route: RouteOrID): Promise<BoundingBox> =>
        getNodes(route)
            .then(nodes => Promise.all([
                _getMinMaxLatLon(nodes, 'lat', 1), // Minimum latitude
                _getMinMaxLatLon(nodes, 'lat', -1), // Maximum latitude
                _getMinMaxLatLon(nodes, 'lon', 1), // Minimum longitude
                _getMinMaxLatLon(nodes, 'lon', -1) // Maximum longitude
            ]))
            .then(([minLat, maxLat, minLon, maxLon]) => {
                return { minLat, maxLat, minLon, maxLon };
            });

    // TODO
    const checkGroups = (groups: string[][], currentNodes: RouteNodeDocument[]): Promise<string[][]> => {
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
    };


    // TODO
    const createGroups = (expeditie: ExpeditieOrID, route: RouteOrID, currentNodes: RouteNodeOrID[], groups: string[][]): Promise<RouteNodeDocument[]> => {
        return Promise.resolve(expeditie)
            .then(Expedities.addParticipants(Util.getObjectIDs([].concat(...groups))))
            .then(() => RouteNodes.getDocuments(currentNodes))
            .then(currentNodes => {
                const newRouteNodes: string[][] = [];
                const pRouteNodes: Promise<RouteNodeDocument>[] = [];

                for (let group of groups) {
                    let groupNeedsNewNode = true;
                    let nonNewNode = null;

                    for (let node of currentNodes) {
                        if (Util.documentArraysEqual(node.persons, group)) {
                            groupNeedsNewNode = false;
                            nonNewNode = node;
                            break;
                        }
                    }

                    if (groupNeedsNewNode) {
                        newRouteNodes.push(Util.getObjectIDs(group));
                    } else {
                        pRouteNodes.push(RouteNodes.getDocument(nonNewNode));
                    }
                }

                pRouteNodes.push(
                    ...newRouteNodes.map(groupIds => {
                        return RouteNodes.create({
                            route: Util.getObjectID(route),
                            persons: groupIds,
                            edges: []
                        });
                    })
                );

                return Promise.all(pRouteNodes);
            });
    };
}