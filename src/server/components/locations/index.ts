import { LocationHelper } from '../../helpers/locationHelper';
import { Routes } from '../routes';
import { Util } from '../documents/util';
import { Location, LocationDocument, LocationModel, LocationOrID } from './model';
import { RouteOrID } from '../routes/model';
import { RouteNodeDocument } from '../routenodes/model';
import { PersonOrID } from '../people/model';
import { Documents } from '../documents/new';
import * as R from 'ramda';

export namespace Locations {
    export const getById = (id: string): Promise<LocationDocument | null> =>
        LocationModel.findById(id).exec();

    export const getDocument = (location: LocationOrID): Promise<LocationDocument | null> =>
        Util.getDocument(getById)(location);

    const _setCurrentNodeIfUndefined = (location: Location, route: RouteOrID): Promise<Location> => {
        if (location.node !== undefined)
            return Promise.resolve(location);

        return Routes.getDocument(route)
            .then(Documents.ensureNotNull)
            .then(Routes.getCurrentNodeWithPerson(location.person))
            .then(Documents.ensureNotNull)
            .then(node => location.node = Util.getObjectID(node))
            .then(() => location);
    };

    const _setCurrentNodeIfUndefinedR = R.curry(_setCurrentNodeIfUndefined);

    export const create = (location: Location, route: RouteOrID): Promise<LocationDocument> =>
        Promise.resolve(location)
            .then(_setCurrentNodeIfUndefinedR(R.__, route))
            .then(LocationModel.create)
            .then(LocationHelper.setVisualArea);

    const _setCurrentNodeIfUndefinedMany = (locations: Location[], route: RouteOrID): Promise<Location[]> =>
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

    const _setCurrentNodeIfUndefinedManyR = R.curry(_setCurrentNodeIfUndefinedMany);

    export const createMany = (locations: Location[], route: RouteOrID): Promise<LocationDocument[]> =>
        Promise.resolve(locations)
            .then(_setCurrentNodeIfUndefinedManyR(R.__, route))
            .then(locations => LocationModel.insertMany(locations))
            .then(LocationHelper.setVisualAreas);

    export const remove = (location: LocationOrID): Promise<void> =>
        getDocument(location)
            .then(Documents.ensureNotNull)
            .then(location => location.remove())
            .then(() => undefined);

    export const setVisualArea = (location: LocationOrID, visualArea: number): Promise<LocationDocument | null> =>
        LocationModel.findByIdAndUpdate(
            Util.getObjectID(location),
            { visualArea: visualArea },
            { new: true })
            .exec();
}
