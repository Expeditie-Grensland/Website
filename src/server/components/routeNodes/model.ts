import * as mongoose from 'mongoose';
import { DocumentOrID, reference } from '../documents/util';
import { PersonOrID } from '../people/model';
import { RouteOrID } from '../routes/model';
import { PersonId } from '../people/id';
import { RouteNodeId } from './id';
import { RouteId } from '../routes/id';

/**
 * A RouteEdge represent a moving of people between different RouteNodes.
 */

const routeEdgeSchema = new mongoose.Schema({
    to: reference(RouteNodeId),
    people: [reference(PersonId)]
});

export interface RouteEdge {
    to: RouteNodeOrID;
    people: PersonOrID[];
}

/**
 * A RouteNode is a representation of the locations of one group of people over a continuous time span. This means that
 * as soon as a Person moves from one node to another, one or more RouteEdge is added to the edges array and
 * this node is deactivated.
 */

const schema = new mongoose.Schema({
    route: reference(RouteId),
    color: String,
    persons: [reference(PersonId)],
    edges: [routeEdgeSchema]
});

export interface RouteNode {
    route: RouteOrID;
    color?: string;
    persons: PersonOrID[];
    edges: RouteEdge[];
}

export interface RouteNodeDocument extends RouteNode, mongoose.Document {}

export const RouteNodeModel = mongoose.model<RouteNodeDocument>(RouteNodeId, schema);

export type RouteNodeOrID = DocumentOrID<RouteNodeDocument>;
