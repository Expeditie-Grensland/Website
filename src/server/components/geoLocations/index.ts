import { GeoLocation, GeoLocationDocument, geoLocationModel, GeoLocationOrId } from './model';
import * as mongoose from 'mongoose';
import { Documents } from '../documents/new';
import { Locations } from '../locations';
import { RouteNodes } from '../routeNodes';
import { Expedities } from '../expedities';
import { LocationDocument } from '../locations/model';

export namespace GeoLocations {
    export const getById = (id: mongoose.Types.ObjectId): Promise<GeoLocationDocument | null> =>
        geoLocationModel.findById(id).exec();

    export const getByIds = (ids: mongoose.Types.ObjectId[]): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({ _id: { $in: ids } }).exec();

    export const getAll = (): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({}).exec();

    export const getDocument: (loc: GeoLocationOrId) => Promise<GeoLocationDocument | null> = Documents.getDocument(getById);

    export const getDocuments: (locs: GeoLocationOrId[]) => Promise<GeoLocationDocument[]> = Documents.getDocuments(getByIds);

    export const create = (loc: GeoLocation): Promise<GeoLocationDocument> =>
        geoLocationModel.create(loc);

    export const transferLocations = async () => {
        const routeNodes = await RouteNodes.getAll();
        const expedities = await Expedities.getAll();

        const routeNodetoExpeditieMap: Map<string, string> = new Map();

        for (let n of routeNodes) {
            const id = n._id.toHexString();
            const routeId = n.route;
            const expeditieId = expedities.find(e => e.route == routeId)!._id.toHexString();
            routeNodetoExpeditieMap.set(id, expeditieId);
        }

        const locations: LocationDocument[] = await Locations.getAll();
        const geoLocations: GeoLocation[] = [];

        for (let l of locations) {
            const newLoc: GeoLocation = {
                _id: l._id,
                expeditieId: mongoose.Types.ObjectId(routeNodetoExpeditieMap.get(<string>l.node!)),
                personId: mongoose.Types.ObjectId(<string>l.person!),
                time: l.timestamp,
                timezone: l.timezone,
                latitude: l.lat,
                longitude: l.lon,
                visualArea: l.visualArea
            };
            if (l.altitude) newLoc.altitude = l.altitude;
            if (l.horizontalAccuracy) newLoc.horizontalAccuracy = l.horizontalAccuracy;
            if (l.verticalAccuracy) newLoc.verticalAccuracy = l.verticalAccuracy;
            if (l.speed) newLoc.speed = l.speed;
            if (l.speedAccuracy) newLoc.speedAccuracy = l.speedAccuracy;
            if (l.bearing) newLoc.bearing = l.bearing;
            if (l.bearingAccuracy) newLoc.bearingAccuracy = l.bearingAccuracy;
            geoLocations.push(newLoc);
        }

        geoLocationModel.insertMany(geoLocations);
    };
}
