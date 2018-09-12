import { LocationHelper } from '../../helpers/locationHelper';
import { Route } from '../route';
import { Util } from '../document/util';
import { ILocation, LocationDocument, LocationOrID, LocationSchema } from './model';
import { RouteOrID } from '../route/model';
import { RouteNodeDocument, RouteNodeOrID } from '../routenode/model';
import { PersonOrID } from '../person/model';

export namespace Location {
    export function getById(_id: string): Promise<LocationDocument> {
        return LocationSchema.findById(_id).exec();
    }

    export function getByIds(ids: string[]): Promise<LocationDocument[]> {
        return LocationSchema.find({ _id: { $in: ids } }).exec();
    }

    export function getDocument(location: LocationOrID): Promise<LocationDocument> {
        return Util.getDocument(location, getById);
    }

    export function getDocuments(locations: LocationOrID[]): Promise<LocationDocument[]> {
        return Util.getDocuments(locations, getByIds);
    }

    export function getMinMaxLatLonLocation(nodes: RouteNodeOrID[], minMax: 'min' | 'max', latLon: 'lat' | 'lon'): Promise<LocationDocument[]> {
        const nodeIDs = Util.getObjectIDs(nodes);

        let sorting;

        if (latLon === 'lat') {
            sorting = { lat: minMax == 'min' ? 1 : -1 };
        } else {
            sorting = { lon: minMax == 'min' ? 1 : -1 };
        }

        return LocationSchema.find({ node: { $in: nodeIDs } })
            .sort(sorting)
            .limit(1)
            .exec();
    }

    export async function create(location: ILocation, route: RouteOrID): Promise<LocationDocument> {
        const routeDoc = await Route.getDocument(route);

        if (location.node === undefined) {
            const node = await Route.getCurrentNodeWithPerson(location.person)(routeDoc);
            location.node = Util.getObjectID(node);
        }

        if (location.visualArea === undefined) {
            //By default sort first
            location.visualArea = Number.POSITIVE_INFINITY;
        }

        let locationDoc = await LocationSchema.create(location);

        locationDoc = await LocationHelper.setVisualArea(locationDoc);

        return locationDoc;
    }

    export async function createMany(locations: ILocation[], route: RouteOrID): Promise<LocationDocument[]> {
        const routeDoc = await Route.getDocument(route);

        let currentNodeWithPerson: Map<string, Promise<RouteNodeDocument>> = new Map();

        function currentNodeWithPersonCached(person: PersonOrID): Promise<RouteNodeDocument> {
            if (!currentNodeWithPerson.has(Util.getObjectID(person))) {
                currentNodeWithPerson.set(Util.getObjectID(person), Route.getCurrentNodeWithPerson(person)(routeDoc));
            }
            return currentNodeWithPerson.get(Util.getObjectID(person));
        }

        for (let location of locations) {
            if (location.visualArea === undefined) {
                //By default, load first
                location.visualArea = Number.POSITIVE_INFINITY;
            }

            if (location.node === undefined) {
                const node = await currentNodeWithPersonCached(location.person);
                location.node = Util.getObjectID(node);
            }
        }

        const locationDocs = await LocationSchema.insertMany(locations);

        const locationsPromise = LocationHelper.setVisualAreas(locationDocs);

        return await locationsPromise;
    }

    export function remove(location): Promise<void> {
        return getDocument(location)
            .then(document => {
                return document.remove();
            })
            .then(() => null);
    }

    export function setVisualArea(visualArea: number): (location: LocationOrID) => Promise<LocationDocument> {
        return location => LocationSchema.findByIdAndUpdate(Util.getObjectID(location), { visualArea: visualArea }, { new: true }).exec();
    }

    export function getInRoute(route: RouteOrID): Promise<LocationDocument[]> {
        return Route.getNodes(route).then(nodes => LocationSchema.find({ node: { $in: Util.getObjectIDs(nodes) } }).exec());
    }

    export function getInRouteSortedByArea(skip: number, limit: number): (route: RouteOrID) => Promise<LocationDocument[]> {
        return async route => {
            const nodes = await Route.getNodes(route);

            return LocationSchema.find({ node: { $in: Util.getObjectIDs(nodes) } })
                .sort({ visualArea: 'desc' })
                .skip(skip)
                .limit(limit)
                .find()
                .exec();
        };
    }

    export function getInNodeByTimestampDescending(node: RouteNodeOrID, skip: number, limit: number): Promise<LocationDocument[]> {
        return LocationSchema.find({ node: Util.getObjectID(node) })
            .sort({ timestamp: 'desc' })
            .skip(skip)
            .limit(limit)
            .exec();
    }
}
