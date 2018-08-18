import * as gpxparse from 'gpx-parse';

import { LocationHelper } from '../../helpers/locationHelper';
import { Route } from '../route';
import { Util } from '../document/util';
import { ILocation, LocationDocument, LocationOrID, LocationSchema } from "./model";
import { RouteOrID } from "../route/model";
import { RouteNodeDocument, RouteNodeOrID } from "../routenode/model";
import { PersonOrID } from "../person/model";

export namespace Location {
    export function getLocationById(_id: string): Promise<LocationDocument> {
        return LocationSchema.findById(_id).exec();
    }

    export function getLocationsById(ids: string[]): Promise<LocationDocument[]> {
        return LocationSchema.find({ _id: { $in: ids } }).exec();
    }

    export function getLocation(location: LocationOrID): Promise<LocationDocument> {
        return Util.getDocument(location, getLocationById);
    }

    export function getLocations(locations: LocationOrID[]): Promise<LocationDocument[]> {
        return Util.getDocuments(locations, getLocationsById);
    }

    export async function createLocation(location: ILocation, route: RouteOrID): Promise<LocationDocument> {
        const routeDoc = await Route.getRoute(route);

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

    export async function createLocations(locations: ILocation[], route: RouteOrID): Promise<LocationDocument[]> {
        const routeDoc = await Route.getRoute(route);

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

    export function removeLocation(location): Promise<void> {
        return getLocation(location)
            .then(document => {
                return document.remove();
            })
            .then(() => null);
    }

    export function setLocationVisualArea(visualArea: number): (location: LocationOrID) => Promise<LocationDocument> {
        return location => LocationSchema.findByIdAndUpdate(Util.getObjectID(location), { visualArea: visualArea }, { new: true }).exec();
    }

    export function getLocationsInRoute(route: RouteOrID): Promise<LocationDocument[]> {
        return Route.getNodes(route).then(nodes => LocationSchema.find({ node: { $in: Util.getObjectIDs(nodes) } }).exec());
    }

    export function getLocationsInRouteSortedByArea(skip: number, limit: number): (route: RouteOrID) => Promise<LocationDocument[]> {
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

    export function getLocationsInNodeByTimestampDescending(node: RouteNodeOrID, skip: number, limit: number): Promise<LocationDocument[]> {
        return LocationSchema.find({ node: Util.getObjectID(node) })
            .sort({ timestamp: 'desc' })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    export function fromGPX(gpx, person: PersonOrID): Promise<ILocation[]> {
        return new Promise(resolve =>
            gpxparse.parseGpx(gpx, (error, data) => {
                if (error) return console.error(error);

                const personId = Util.getObjectID(person);
                const track = data.tracks[0];

                console.log('Track length: ' + track.length());

                const locations: ILocation[] = [];

                for (let seg of track.segments) {
                    for (let waypoint of seg) {
                        locations.push({
                            person: personId,
                            timestamp: Date.parse(waypoint.time).valueOf(),
                            timezone: 'Europe/Amsterdam',
                            lat: waypoint.lat,
                            lon: waypoint.lon,
                            altitude: waypoint.elevation
                        });
                    }
                }

                resolve(locations);
            })
        );
    }
}
