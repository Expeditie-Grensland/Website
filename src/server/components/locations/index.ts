import { LocationHelper } from '../../helpers/locationHelper';
import { Routes } from '../routes';
import { Util } from '../documents/util';
import { Location, LocationDocument, LocationModel, LocationOrID } from './model';
import { RouteOrID } from '../routes/model';
import { RouteNodeDocument, RouteNodeOrID } from '../routenodes/model';
import { PersonOrID } from '../people/model';
import { ExpeditieOrID } from '../expedities/model';
import { Expedities } from '../expedities';
import { Documents } from '../documents/new';

export namespace Locations {
    export const getById = (id: string): Promise<LocationDocument | null> =>
        LocationModel.findById(id).exec();

    export const getDocument = (location: LocationOrID): Promise<LocationDocument | null> =>
        Util.getDocument(getById)(location);

    const _setCurrentNodeIfUndefined = (route: RouteOrID) => (location: Location): Promise<Location> => {
        if (location.node !== undefined)
            return Promise.resolve(location);

        return Routes.getDocument(route)
            .then(Documents.ensureNotNull)
            .then(Routes.getCurrentNodeWithPerson(location.person))
            .then(Documents.ensureNotNull)
            .then(node => location.node = Util.getObjectID(node))
            .then(() => location);
    };

    export const create = (location: Location, route: RouteOrID): Promise<LocationDocument> =>
        Promise.resolve(location)
            .then(_setCurrentNodeIfUndefined(route))
            .then(LocationModel.create)
            .then(LocationHelper.setVisualArea);

    const _setCurrentNodeIfUndefinedMany = (route: RouteOrID) => (locations: Location[]): Promise<Location[]> =>
        Routes.getDocument(route)
            .then(Documents.ensureNotNull)
            .then(route => {
                // TODO: change when changing to ObjectIds
                let personIdToRouteNodeMap: Map<string, Promise<RouteNodeDocument>> = new Map();

                const _getCurrentNodeWithPersonCached = (person: PersonOrID): Promise<RouteNodeDocument> => {
                    let routeNode: Promise<RouteNodeDocument> | undefined = personIdToRouteNodeMap.get(Util.getObjectID(person));

                    if (!routeNode) {
                        routeNode = Routes.getCurrentNodeWithPerson(person)(route).then(Documents.ensureNotNull);
                        personIdToRouteNodeMap.set(Util.getObjectID(person), routeNode);
                    }

                    return routeNode;
                };

                const _setCurrentNodeIfUndefinedCached = (location: Location): Promise<Location> => {
                    if (location.node !== undefined)
                        return Promise.resolve(location);

                    return _getCurrentNodeWithPersonCached(location.person)
                        .then(Documents.ensureNotNull)
                        .then(node => location.node = Util.getObjectID(node))
                        .then(() => location);
                };

                return Promise.all(locations.map(_setCurrentNodeIfUndefinedCached));
            });

    export const createMany = (locations: Location[], route: RouteOrID): Promise<LocationDocument[]> =>
        Promise.resolve(locations)
            .then(_setCurrentNodeIfUndefinedMany(route))
            .then(locations => LocationModel.insertMany(locations))
            .then(LocationHelper.setVisualAreas);

    export const remove = (location: LocationOrID): Promise<void> =>
        getDocument(location)
            .then(Documents.ensureNotNull)
            .then(location => location.remove())
            .then(() => undefined);

    export const setVisualArea = (visualArea: number) => (location: LocationOrID): Promise<LocationDocument | null> =>
        LocationModel.findByIdAndUpdate(
            Util.getObjectID(location),
            { visualArea: visualArea },
            { new: true })
            .exec();

    export const getInRoute = (route: RouteOrID): Promise<LocationDocument[]> =>
        Routes.getNodes(route)
            .then(nodes => LocationModel.find({ node: { $in: Util.getObjectIDs(nodes) } }).exec());

    export const getInExpeditieSortedByVisualArea = (expeditie: ExpeditieOrID, skip: number, limit: number): Promise<LocationDocument[]> =>
        Expedities.getRoute(expeditie)
            .then(Routes.getNodes)
            .then(nodes => LocationModel.find({ node: { $in: Util.getObjectIDs(nodes) } })
                .sort({ visualArea: 'desc' })
                .skip(skip)
                .limit(limit)
                .exec());

    export const getInNodeByTimestampDescending = (node: RouteNodeOrID, skip: number, limit: number): Promise<LocationDocument[]> =>
        LocationModel.find({ node: Util.getObjectID(node) })
            .sort({ timestamp: 'desc' })
            .skip(skip)
            .limit(limit)
            .exec();
}
