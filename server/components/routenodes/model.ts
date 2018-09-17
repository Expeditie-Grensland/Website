import * as mongoose from 'mongoose';
import { DocumentOrID, reference } from '../documents/util';
import { PersonID, PersonOrID } from '../people/model';
import { RouteID, RouteOrID } from '../routes/model';

export const RouteNodeID = 'RouteNode';

/**
 * A RouteEdge represent a moving of people between different RouteNodes.
 */

const routeEdgeSchema = new mongoose.Schema({
    to: reference(RouteNodeID),
    people: [reference(PersonID)]
});

export interface IRouteEdge {
    to: RouteNodeOrID;
    people: PersonOrID[];
}

/**
 * A RouteNode is a representation of the locations of one group of people over a continuous time span. This means that
 * as soon as a Person moves from one node to another, one or more RouteEdge is added to the edges array and
 * this node is deactivated.
 */

const schema = new mongoose.Schema({
    route: reference(RouteID),
    color: String,
    persons: [reference(PersonID)],
    edges: [routeEdgeSchema]
});

export interface IRouteNode {
    route: RouteOrID;
    color?: string;
    persons: PersonOrID[];
    edges: IRouteEdge[];
}

export interface RouteNodeDocument extends IRouteNode, mongoose.Document {}

export const RouteNodeModel = mongoose.model<RouteNodeDocument>(RouteNodeID, schema);

export type RouteNodeOrID = DocumentOrID<RouteNodeDocument>;
