import * as mongoose from "mongoose";
import { DocumentOrID, reference } from '../document/util';
import { RouteNodeID, RouteNodeOrID } from "../routenode/model";

export const RouteID = 'Route';

/**
 * The bounding 'box' (more like a rectangle on a sphere) for a Route. All points in a Route lie on or within the
 * defining coordinates of this rectangle.
 */

export interface IBoundingBox {
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
    startingNodes: [reference(RouteNodeID)],
    currentNodes: [reference(RouteNodeID)]
});

export interface IRoute {
    startingNodes?: RouteNodeOrID[];
    currentNodes?: RouteNodeOrID[];
}

export interface RouteDocument extends IRoute, mongoose.Document {}

export const RouteSchema = mongoose.model<RouteDocument>(RouteID, schema);

export type RouteOrID = DocumentOrID<RouteDocument>;
