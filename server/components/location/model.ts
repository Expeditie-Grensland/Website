import * as mongoose from 'mongoose';
import { DocumentOrID, reference } from '../document/util';
import { PersonID, PersonOrID } from '../person/model';
import { RouteNodeID, RouteNodeOrID } from '../routenode/model'

export const LocationID = 'Location';

/**
 * A Location describes the output of a GPS receiver, using latitude, longitude
 * altitude, and speed and bearing of travel. For each variable, an accuracy is provided.
 * The `visualArea` indicates the area of the triangle formed by this location and it's two adjacent points in
 * square meter. A bigger area indicates a bigger contribution to the visual 'shape' of a route line. This value is
 * used to determine the order of points sent to a client. Locations with higher visual areas get sent before those
 * with low visual area.
 * A Location belongs to one, and only one, IRouteNode.
 */

const schema = new mongoose.Schema({
    visualArea: Number,
    person: reference(PersonID),
    node: reference(RouteNodeID),
    timestamp: Number,
    timezone: String,
    lat: Number,
    lon: Number,
    altitude: Number,
    horizontalAccuracy: Number,
    verticalAccuracy: Number,
    bearing: Number,
    bearingAccuracy: Number,
    speed: Number,
    speedAccuracy: Number
});

// Ensure fast retrieval of find query by visual area. This query is performed every site visit, so it should
// be performant.
schema.index({ node: 1, visualArea: -1 });
schema.index({ node: 1, timestamp: -1 });
schema.index({ node: 1, lat: 1 });
schema.index({ node: 1, lon: 1 });

export interface ILocation {
    visualArea?: number;
    person: PersonOrID;
    node?: RouteNodeOrID;
    timestamp: number;
    timezone: string;
    lat: number;
    lon: number;
    altitude: number;
    horizontalAccuracy?: number;
    verticalAccuracy?: number;
    bearing?: number;
    bearingAccuracy?: number;
    speed?: number;
    speedAccuracy?: number;
}

export interface LocationDocument extends ILocation, mongoose.Document {}

export const LocationSchema = mongoose.model<LocationDocument>(LocationID, schema);

export type LocationOrID = DocumentOrID<LocationDocument>;
