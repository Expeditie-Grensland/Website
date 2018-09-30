import * as mongoose from 'mongoose';
import { DocumentOrID, reference } from '../documents/util';
import { RouteNodeOrID } from '../routeNodes/model';
import { RouteNodeId } from '../routeNodes/id';
import { RouteId } from './id';

/**
 * The bounding 'box' (more like a rectangle on a sphere) for a Route. All points in a Route lie on or within the
 * defining coordinates of this rectangle.
 */

export interface BoundingBox {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
}

/**
 * A Route is a directed acyclic graph representing the movement of people between different groups.
 * The startingNodes array contains all nodes which do not have any ancestors (there are no edges pointing to them)
 * The currentNodes array contains all nodes that do not have any children.
 */

const schema = new mongoose.Schema({
    startingNodes: [reference(RouteNodeId)],
    currentNodes: [reference(RouteNodeId)]
});

export interface Route {
    startingNodes?: RouteNodeOrID[];
    currentNodes?: RouteNodeOrID[];
}

export interface RouteDocument extends Route, mongoose.Document {}

export const RouteModel = mongoose.model<RouteDocument>(RouteId, schema);

export type RouteOrID = DocumentOrID<RouteDocument>;
